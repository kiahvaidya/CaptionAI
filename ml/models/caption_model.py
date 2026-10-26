import torch
import torch.nn as nn
from typing import List, Tuple, Dict, Any
from ml.encoder.resnet_encoder import CNNEncoder
from ml.decoder.lstm_decoder import LSTMDecoder
from ml.preprocessing.text_tokenizer import Vocabulary

class ImageCaptioningModel(nn.Module):
    """
    End-to-end Image Captioning Deep Learning Architecture:
    Input Image -> ResNet50 CNN Encoder -> Visual Feature Vector -> LSTM Decoder -> Generated Caption
    """
    def __init__(
        self,
        embed_dim: int = 512,
        hidden_dim: int = 512,
        vocab_size: int = 5000,
        num_layers: int = 1,
        dropout_p: float = 0.3,
        fine_tune_encoder: bool = False
    ):
        super(ImageCaptioningModel, self).__init__()
        self.encoder = CNNEncoder(embed_dim=embed_dim, fine_tune=fine_tune_encoder)
        self.decoder = LSTMDecoder(
            embed_dim=embed_dim,
            hidden_dim=hidden_dim,
            vocab_size=vocab_size,
            num_layers=num_layers,
            dropout_p=dropout_p
        )
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim
        self.vocab_size = vocab_size

    def forward(self, images: torch.Tensor, captions: torch.Tensor) -> torch.Tensor:
        global_features, _ = self.encoder(images)
        outputs = self.decoder(global_features, captions)
        return outputs

    def generate_caption(
        self,
        image_tensor: torch.Tensor,
        vocab: Vocabulary,
        max_len: int = 25,
        temperature: float = 1.0,
        beam_size: int = 1
    ) -> Tuple[str, List[float], torch.Tensor]:
        """
        Generate caption for a single image tensor (1, 3, 224, 224).
        Returns:
            caption_str: decoded string caption
            confidence_scores: token-level prediction confidences
            spatial_features: (1, 2048, 7, 7) spatial features for attention overlay
        """
        self.eval()
        with torch.no_grad():
            global_features, spatial_features = self.encoder(image_tensor)
            words, scores = self.decoder.generate(
                global_features,
                vocab=vocab,
                max_len=max_len,
                temperature=temperature,
                beam_size=beam_size
            )
            caption_str = " ".join(words)
            return caption_str, scores, spatial_features
