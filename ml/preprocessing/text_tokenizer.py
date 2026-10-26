import re
import json
from collections import Counter
from typing import List, Dict, Optional

class Vocabulary:
    PAD_TOKEN = "<pad>"
    START_TOKEN = "<start>"
    END_TOKEN = "<end>"
    UNK_TOKEN = "<unk>"

    def __init__(self, freq_threshold: int = 2):
        self.freq_threshold = freq_threshold
        self.itos: Dict[int, str] = {
            0: self.PAD_TOKEN,
            1: self.START_TOKEN,
            2: self.END_TOKEN,
            3: self.UNK_TOKEN,
        }
        self.stoi: Dict[str, int] = {v: k for k, v in self.itos.items()}

    def __len__(self):
        return len(self.itos)

    @staticmethod
    def clean_text(text: str) -> str:
        """Standard caption cleaning: lowercase, strip punctuation, remove extra spaces."""
        text = text.lower().strip()
        # Keep alphanumeric characters and common punctuation
        text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
        text = re.sub(r"\s+", " ", text)
        return text

    @staticmethod
    def tokenize(text: str) -> List[str]:
        cleaned = Vocabulary.clean_text(text)
        return cleaned.split()

    def build_vocab(self, sentence_list: List[str]):
        frequencies = Counter()
        idx = len(self.itos)

        for sentence in sentence_list:
            tokens = self.tokenize(sentence)
            frequencies.update(tokens)

        for word, count in frequencies.items():
            if count >= self.freq_threshold and word not in self.stoi:
                self.stoi[word] = idx
                self.itos[idx] = word
                idx += 1

    def numericalize(self, text: str, add_special_tokens: bool = True) -> List[int]:
        """Converts text into a list of vocabulary token indices."""
        tokens = self.tokenize(text)
        result = []
        if add_special_tokens:
            result.append(self.stoi[self.START_TOKEN])

        for token in tokens:
            result.append(self.stoi.get(token, self.stoi[self.UNK_TOKEN]))

        if add_special_tokens:
            result.append(self.stoi[self.END_TOKEN])

        return result

    def decode(self, indices: List[int], remove_special: bool = True) -> str:
        """Converts token indices back into a human-readable caption."""
        words = []
        for idx in indices:
            if idx in self.itos:
                token = self.itos[idx]
                if remove_special and token in [self.PAD_TOKEN, self.START_TOKEN, self.UNK_TOKEN]:
                    continue
                if remove_special and token == self.END_TOKEN:
                    break
                words.append(token)
        return " ".join(words)

    def save(self, filepath: str):
        data = {
            "freq_threshold": self.freq_threshold,
            "stoi": self.stoi,
            "itos": {str(k): v for k, v in self.itos.items()}
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    @classmethod
    def load(cls, filepath: str) -> "Vocabulary":
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        vocab = cls(freq_threshold=data.get("freq_threshold", 2))
        vocab.stoi = data["stoi"]
        vocab.itos = {int(k): v for k, v in data["itos"].items()}
        return vocab
