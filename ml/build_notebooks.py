import json
import os

def make_notebook(cells, filepath):
    nb = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.13"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Created notebook: {filepath}")

# 1. data_preprocessing.ipynb
cells_prep = [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# CaptionAI: Data Preprocessing Pipeline\n",
            "This notebook details the image and text preprocessing steps for training the ResNet50 + LSTM Image Captioning model on Flickr8k."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import os\n",
            "import re\n",
            "from PIL import Image\n",
            "import matplotlib.pyplot as plt\n",
            "from ml.preprocessing.text_tokenizer import Vocabulary\n",
            "from ml.preprocessing.image_transforms import get_image_transforms\n",
            "\n",
            "print('Libraries successfully imported!')"
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 1. Caption Cleaning & Vocabulary Construction\n",
            "Text captions must be cleaned (lowercased, stripped of non-alphanumeric punctuation) and tokenized with special tokens: `<pad>`, `<start>`, `<end>`, and `<unk>`."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "sample_captions = [\n",
            "    'A person standing on the beach during a golden sunset.',\n",
            "    'A dog running happily across green grass in a park!',\n",
            "    'A woman drinking hot coffee at a modern cafe.',\n",
            "    'A group of friends laughing together outdoors.'\n",
            "]\n",
            "\n",
            "vocab = Vocabulary(freq_threshold=1)\n",
            "vocab.build_vocab(sample_captions)\n",
            "print(f'Vocabulary size: {len(vocab)}')\n",
            "print('Sample tokens in vocab:', list(vocab.stoi.items())[:15])\n",
            "\n",
            "test_sentence = 'A person enjoying the golden sunset.'\n",
            "numericalized = vocab.numericalize(test_sentence)\n",
            "print(f'Numericalized indices: {numericalized}')\n",
            "decoded = vocab.decode(numericalized)\n",
            "print(f'Decoded back: {decoded}')"
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 2. Image Preprocessing & ResNet Normalization\n",
            "Images are resized to 256x256, cropped to 224x224, converted to PyTorch tensors, and normalized with ImageNet mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "transform = get_image_transforms(is_train=False)\n",
            "dummy_img = Image.new('RGB', (300, 300), color=(100, 150, 200))\n",
            "tensor_img = transform(dummy_img)\n",
            "print(f'Processed Tensor shape: {tensor_img.shape}')\n",
            "print(f'Tensor min: {tensor_img.min():.2f}, max: {tensor_img.max():.2f}')"
        ]
    }
]

# 2. model_training.ipynb
cells_train = [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# CaptionAI: Model Training Pipeline\n",
            "Architecture: **ResNet50 CNN Encoder + LSTM Decoder**\n",
            "\n",
            "Pipeline Flow:\n",
            "1. ResNet50 extracts a 2048-dim feature vector from the 224x224 image.\n",
            "2. A linear projection aligns the visual feature with the decoder embedding dimension (512-dim).\n",
            "3. The LSTM decoder receives the visual feature followed by word token embeddings.\n",
            "4. Cross-entropy loss trains the model with teacher forcing."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import torch\n",
            "import torch.nn as nn\n",
            "from ml.models.caption_model import ImageCaptioningModel\n",
            "from ml.preprocessing.text_tokenizer import Vocabulary\n",
            "\n",
            "device = 'cuda' if torch.cuda.is_available() else ('mps' if torch.backends.mps.is_available() else 'cpu')\n",
            "print(f'Training on device: {device}')"
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "vocab = Vocabulary.load('checkpoints/vocab.json')\n",
            "model = ImageCaptioningModel(\n",
            "    embed_dim=512,\n",
            "    hidden_dim=512,\n",
            "    vocab_size=len(vocab),\n",
            "    fine_tune_encoder=False\n",
            ").to(device)\n",
            "\n",
            "print('Model Architecture:')\n",
            "print(model)"
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## Training Step (Loss & Optimizer)\n",
            "We use Adam optimizer (`lr=3e-4`) and `CrossEntropyLoss(ignore_index=pad_token)`."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "criterion = nn.CrossEntropyLoss(ignore_index=vocab.stoi[vocab.PAD_TOKEN])\n",
            "optimizer = torch.optim.Adam(model.parameters(), lr=3e-4)\n",
            "print('Criterion and optimizer configured successfully.')"
        ]
    }
]

# 3. evaluation.ipynb
cells_eval = [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# CaptionAI: Model Evaluation & Metrics\n",
            "Evaluation of generated captions against human ground-truth reference captions using standard natural language metrics:\n",
            "* **BLEU-1** (Unigram Precision)\n",
            "* **BLEU-2** (Bigram Precision)\n",
            "* **BLEU-3** (Trigram Precision)\n",
            "* **BLEU-4** (4-gram Precision)\n",
            "* **METEOR** (Harmonic mean of precision and recall with unigram alignment)"
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "from ml.evaluation.metrics import compute_bleu_scores, compute_meteor, evaluate_caption_batch\n",
            "\n",
            "references = [\n",
            "    ['a person standing on the beach during a beautiful golden sunset', 'a man watching the sunset by the ocean'],\n",
            "    ['a happy dog running in a sunny green park', 'a brown dog playing on the grass']\n",
            "]\n",
            "candidates = [\n",
            "    'a person standing on the beach during a beautiful golden sunset',\n",
            "    'a dog running happily in the green grass'\n",
            "]\n",
            "\n",
            "results = evaluate_caption_batch(references, candidates)\n",
            "print('=== Benchmark Evaluation Results ===')\n",
            "for k, v in results.items():\n",
            "    print(f'{k}: {v}')"
        ]
    }
]

os.makedirs("notebooks", exist_ok=True)
make_notebook(cells_prep, "notebooks/data_preprocessing.ipynb")
make_notebook(cells_train, "notebooks/model_training.ipynb")
make_notebook(cells_eval, "notebooks/evaluation.ipynb")
