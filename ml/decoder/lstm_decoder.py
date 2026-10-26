import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Tuple, Optional

class BahdanauAttention(nn.Module):
    """Additive Bahdanau Attention mechanism for image captioning."""
    def __init__(self, encoder_dim: int, decoder_dim: int, attention_dim: int):
        super(BahdanauAttention, self).__init__()
        self.encoder_att = nn.Linear(encoder_dim, attention_dim)
        self.decoder_att = nn.Linear(decoder_dim, attention_dim)
        self.full_att = nn.Linear(attention_dim, 1)
        self.relu = nn.ReLU()
        self.softmax = nn.Softmax(dim=1)

    def forward(self, encoder_out: torch.Tensor, decoder_hidden: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        encoder_out: (batch_size, num_pixels, encoder_dim) e.g. 7x7=49
        decoder_hidden: (batch_size, decoder_dim)
        returns:
            attention_weighted_encoding: (batch_size, encoder_dim)
            alpha: attention weights (batch_size, num_pixels)
        """
        att1 = self.encoder_att(encoder_out)       # (batch_size, num_pixels, attention_dim)
        att2 = self.decoder_att(decoder_hidden)     # (batch_size, attention_dim)
        att = self.full_att(self.relu(att1 + att2.unsqueeze(1))).squeeze(2) # (batch_size, num_pixels)
        alpha = self.softmax(att)
        attention_weighted_encoding = (encoder_out * alpha.unsqueeze(2)).sum(dim=1)
        return attention_weighted_encoding, alpha

class LSTMDecoder(nn.Module):
    """
    LSTM Decoder with attention for generating captions word-by-word.
    Supports standard teacher-forcing training and beam/greedy search generation.
    """
    def __init__(
        self,
        embed_dim: int = 512,
        hidden_dim: int = 512,
        vocab_size: int = 5000,
        num_layers: int = 1,
        dropout_p: float = 0.3
    ):
        super(LSTMDecoder, self).__init__()
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim
        self.vocab_size = vocab_size
        self.num_layers = num_layers
        
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.dropout = nn.Dropout(dropout_p)
        
        # LSTM input: concatenated word embedding + image feature embedding
        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout_p if num_layers > 1 else 0
        )
        
        # Transform image features into initial hidden and cell state
        self.init_h = nn.Linear(embed_dim, hidden_dim)
        self.init_c = nn.Linear(embed_dim, hidden_dim)
        
        self.fc_out = nn.Linear(hidden_dim, vocab_size)

    def init_hidden_state(self, encoder_out: torch.Tensor):
        h = torch.tanh(self.init_h(encoder_out)).unsqueeze(0).repeat(self.num_layers, 1, 1)
        c = torch.tanh(self.init_c(encoder_out)).unsqueeze(0).repeat(self.num_layers, 1, 1)
        return h, c

    def forward(self, features: torch.Tensor, captions: torch.Tensor) -> torch.Tensor:
        """
        Forward pass for training.
        Args:
            features: (batch_size, embed_dim) from CNN encoder
            captions: (batch_size, max_seq_len) padded token IDs
        Returns:
            outputs: (batch_size, max_seq_len, vocab_size) prediction logits
        """
        # Exclude <end> token from input sequence
        embeddings = self.embedding(captions[:, :-1]) # (batch_size, seq_len-1, embed_dim)
        embeddings = self.dropout(embeddings)
        
        # Prepend visual features as the first token input to the LSTM sequence
        features_expanded = features.unsqueeze(1) # (batch_size, 1, embed_dim)
        inputs = torch.cat((features_expanded, embeddings), dim=1) # (batch_size, seq_len, embed_dim)
        
        h0, c0 = self.init_hidden_state(features)
        lstm_out, _ = self.lstm(inputs, (h0, c0))
        
        outputs = self.fc_out(self.dropout(lstm_out)) # (batch_size, seq_len, vocab_size)
        return outputs

    def generate(
        self,
        features: torch.Tensor,
        vocab,
        max_len: int = 25,
        temperature: float = 1.0,
        beam_size: int = 1
    ) -> Tuple[List[str], List[float]]:
        """
        Generates caption using greedy or temperature-based sampling.
        """
        self.eval()
        device = features.device
        
        with torch.no_grad():
            h, c = self.init_hidden_state(features)
            
            # Start token
            input_token = torch.tensor([vocab.stoi[vocab.START_TOKEN]], device=device)
            current_embed = self.embedding(input_token).unsqueeze(0) # (1, 1, embed_dim)
            
            # First step incorporates the visual features
            first_input = torch.cat((features.unsqueeze(1), current_embed), dim=1)
            out, (h, c) = self.lstm(first_input, (h, c))
            
            token_ids = []
            scores = []
            
            curr_input = self.embedding(input_token).unsqueeze(0)
            
            for _ in range(max_len):
                out, (h, c) = self.lstm(curr_input, (h, c))
                logits = self.fc_out(out.squeeze(1)) / max(temperature, 1e-4)
                probs = F.softmax(logits, dim=-1)
                
                predicted_id = torch.argmax(probs, dim=-1).item()
                confidence = probs[0, predicted_id].item()
                
                if predicted_id == vocab.stoi[vocab.END_TOKEN]:
                    break
                    
                token_ids.append(predicted_id)
                scores.append(confidence)
                
                curr_input = self.embedding(torch.tensor([predicted_id], device=device)).unsqueeze(0)
                
            caption_words = [vocab.itos.get(idx, vocab.UNK_TOKEN) for idx in token_ids]
            return caption_words, scores
