"""
sota_model/model.py

Transformer-based neural classifier with mean pooling and multi-sample dropout.
"""

import torch
import torch.nn as nn
from transformers import AutoModel, AutoConfig

class MeanPooling(nn.Module):
    def __init__(self):
        super(MeanPooling, self).__init__()

    def forward(self, last_hidden_state, attention_mask):
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
        sum_embeddings = torch.sum(last_hidden_state * input_mask_expanded, 1)
        sum_mask = input_mask_expanded.sum(1)
        sum_mask = torch.clamp(sum_mask, min=1e-9)
        mean_pooled = sum_embeddings / sum_mask
        return mean_pooled

class DisasterTweetClassifier(nn.Module):
    def __init__(self, model_name="microsoft/deberta-v3-base", num_classes=1, dropouts=[0.1, 0.2, 0.3]):
        super(DisasterTweetClassifier, self).__init__()
        try:
            self.config = AutoConfig.from_pretrained(model_name, local_files_only=True)
            self.config.update({"output_hidden_states": True})
            self.encoder = AutoModel.from_pretrained(model_name, config=self.config, local_files_only=True)
        except Exception:
            self.config = AutoConfig.from_pretrained(model_name)
            self.config.update({"output_hidden_states": True})
            self.encoder = AutoModel.from_pretrained(model_name, config=self.config)

        self.pooler = MeanPooling()
        self.dropouts = nn.ModuleList([nn.Dropout(p) for p in dropouts])
        self.classifier = nn.Linear(self.config.hidden_size, num_classes)
        self._init_weights(self.classifier)

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            module.weight.data.normal_(mean=0.0, std=self.config.initializer_range if hasattr(self.config, 'initializer_range') else 0.02)
            if module.bias is not None:
                module.bias.data.zero_()

    def forward(self, input_ids, attention_mask, token_type_ids=None):
        kwargs = {"input_ids": input_ids, "attention_mask": attention_mask}
        if token_type_ids is not None:
            kwargs["token_type_ids"] = token_type_ids

        outputs = self.encoder(**kwargs)
        feature = self.pooler(outputs.last_hidden_state, attention_mask)
        logits = torch.mean(
            torch.stack([self.classifier(drop(feature)) for drop in self.dropouts], dim=0),
            dim=0
        )
        return logits.squeeze(-1)
