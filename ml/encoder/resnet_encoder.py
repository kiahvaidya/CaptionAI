import torch
import torch.nn as nn
import torchvision.models as models

class CNNEncoder(nn.Module):
    """
    CNN Encoder based on ResNet50 for image feature extraction.
    Extracts high-level visual representations (both global feature vector and spatial feature grid).
    """
    def __init__(self, embed_dim: int = 512, fine_tune: bool = False):
        super(CNNEncoder, self).__init__()
        try:
            resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        except Exception:
            # Offline / local fallback without network download
            resnet = models.resnet50(weights=None)
        
        # Freeze or unfreeze layers based on fine_tune flag
        for param in resnet.parameters():
            param.requires_grad = fine_tune
            
        # Strip final classification head (avgpool and fc) to retain spatial feature maps
        self.modules_list = list(resnet.children())[:-2]
        self.resnet_conv = nn.Sequential(*self.modules_list)
        
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.feature_linear = nn.Linear(resnet.fc.in_features, embed_dim)
        self.bn = nn.BatchNorm1d(embed_dim, momentum=0.01)
        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()

    def forward(self, images: torch.Tensor):
        """
        Forward pass.
        Args:
            images: Tensor of shape (batch_size, 3, 224, 224)
        Returns:
            global_features: Tensor of shape (batch_size, embed_dim)
            spatial_features: Tensor of shape (batch_size, 2048, 7, 7) for attention/explainability
        """
        spatial_features = self.resnet_conv(images)  # (batch_size, 2048, 7, 7)
        pooled = self.avgpool(spatial_features)      # (batch_size, 2048, 1, 1)
        flattened = pooled.view(pooled.size(0), -1)  # (batch_size, 2048)
        
        global_features = self.feature_linear(flattened)
        if global_features.size(0) > 1:
            global_features = self.bn(global_features)
        global_features = self.relu(global_features)
        global_features = self.dropout(global_features)
        
        return global_features, spatial_features
