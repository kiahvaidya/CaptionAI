import os
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import pandas as pd
from typing import List, Tuple, Callable, Optional
from ml.preprocessing.text_tokenizer import Vocabulary
from ml.preprocessing.image_transforms import get_image_transforms

class Flickr8kDataset(Dataset):
    """
    Flickr8k PyTorch Dataset for Image Captioning.
    Loads images and captions, cleans tokens, and converts tokens to tensor sequences.
    """
    def __init__(
        self,
        image_dir: str,
        captions_file: str,
        vocab: Vocabulary,
        transform: Optional[Callable] = None
    ):
        self.image_dir = image_dir
        self.vocab = vocab
        self.transform = transform if transform else get_image_transforms(is_train=True)
        
        # Load captions file (handles both CSV and Flickr8k.token.txt whitespace separated format)
        self.samples: List[Tuple[str, str]] = []
        if os.path.exists(captions_file):
            with open(captions_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                
            # Check header
            start_idx = 1 if "image" in lines[0].lower() and "caption" in lines[0].lower() else 0
            for line in lines[start_idx:]:
                line = line.strip()
                if not line:
                    continue
                if "," in line:
                    parts = line.split(",", 1)
                    img_name, caption = parts[0].strip(), parts[1].strip()
                elif "\t" in line:
                    parts = line.split("\t", 1)
                    img_name, caption = parts[0].split("#")[0].strip(), parts[1].strip()
                else:
                    continue
                self.samples.append((img_name, caption))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, torch.Tensor]:
        img_name, caption = self.samples[index]
        img_path = os.path.join(self.image_dir, img_name)
        
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception:
            # Fallback blank image for missing files during mock/testing
            image = Image.new("RGB", (224, 224), color=(128, 128, 128))
            
        if self.transform:
            image = self.transform(image)
            
        numericalized_caption = self.vocab.numericalize(caption, add_special_tokens=True)
        return image, torch.tensor(numericalized_caption)

class CapsuleCollate:
    """Collate function to pad variable-length caption sequences in each batch."""
    def __init__(self, pad_idx: int):
        self.pad_idx = pad_idx

    def __call__(self, batch: List[Tuple[torch.Tensor, torch.Tensor]]):
        images = [item[0].unsqueeze(0) for item in batch]
        images = torch.cat(images, dim=0)

        targets = [item[1] for item in batch]
        padded_targets = torch.nn.utils.rnn.pad_sequence(
            targets, batch_first=True, padding_value=self.pad_idx
        )
        return images, padded_targets

def get_loader(
    image_dir: str,
    captions_file: str,
    vocab: Vocabulary,
    batch_size: int = 32,
    num_workers: int = 2,
    shuffle: bool = True
):
    dataset = Flickr8kDataset(image_dir, captions_file, vocab)
    pad_idx = vocab.stoi[vocab.PAD_TOKEN]
    collate = CapsuleCollate(pad_idx=pad_idx)
    loader = DataLoader(
        dataset=dataset,
        batch_size=batch_size,
        num_workers=num_workers,
        shuffle=shuffle,
        collate_fn=collate
    )
    return loader, dataset
