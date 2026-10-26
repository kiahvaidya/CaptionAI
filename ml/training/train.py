import os
import argparse
import time
import torch
import torch.nn as nn
import torch.optim as optim
from ml.preprocessing.text_tokenizer import Vocabulary
from ml.dataset.flickr8k_dataset import get_loader
from ml.models.caption_model import ImageCaptioningModel

def train_model(
    image_dir: str,
    captions_file: str,
    checkpoint_dir: str = "checkpoints",
    epochs: int = 5,
    batch_size: int = 32,
    learning_rate: float = 3e-4,
    embed_dim: int = 512,
    hidden_dim: int = 512,
    device: str = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
):
    print(f"[*] Initializing training pipeline on device: {device}")
    os.makedirs(checkpoint_dir, exist_ok=True)
    
    # 1. Build or load Vocabulary
    vocab_path = os.path.join(checkpoint_dir, "vocab.json")
    if os.path.exists(vocab_path):
        print(f"[*] Loading existing vocabulary from {vocab_path}")
        vocab = Vocabulary.load(vocab_path)
    else:
        print("[*] Building vocabulary from caption annotations...")
        vocab = Vocabulary(freq_threshold=2)
        if os.path.exists(captions_file):
            with open(captions_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
            all_captions = [line.split(",", 1)[-1].strip() for line in lines if line.strip()]
            vocab.build_vocab(all_captions)
            vocab.save(vocab_path)
            print(f"[+] Vocabulary built with {len(vocab)} words and saved to {vocab_path}")
        else:
            print(f"[!] Captions file {captions_file} not found. Please provide dataset path.")
            return

    # 2. Data Loader
    train_loader, dataset = get_loader(
        image_dir=image_dir,
        captions_file=captions_file,
        vocab=vocab,
        batch_size=batch_size,
        shuffle=True
    )
    print(f"[*] Loaded dataset with {len(dataset)} caption pairs.")

    # 3. Model, Loss, Optimizer
    model = ImageCaptioningModel(
        embed_dim=embed_dim,
        hidden_dim=hidden_dim,
        vocab_size=len(vocab),
        fine_tune_encoder=False
    ).to(device)

    criterion = nn.CrossEntropyLoss(ignore_index=vocab.stoi[vocab.PAD_TOKEN])
    # Only train decoder and linear projection layers
    parameters = list(model.decoder.parameters()) + list(model.encoder.feature_linear.parameters())
    optimizer = optim.Adam(parameters, lr=learning_rate)

    history = {"train_loss": [], "epoch_times": []}

    # 4. Training Loop
    print("[*] Starting training loop...")
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        start_time = time.time()
        
        for idx, (images, captions) in enumerate(train_loader):
            images = images.to(device)
            captions = captions.to(device)

            optimizer.zero_grad()
            outputs = model(images, captions)
            
            # Loss: calculate cross entropy across seq_len, skipping the initial image token
            loss = criterion(
                outputs[:, 1:, :].reshape(-1, outputs.shape[2]),
                captions.reshape(-1)
            )
            loss.backward()
            torch.nn.utils.clip_grad_norm_(parameters, max_norm=5.0)
            optimizer.step()

            total_loss += loss.item()
            if (idx + 1) % 50 == 0 or (idx + 1) == len(train_loader):
                print(f"Epoch [{epoch}/{epochs}] Step [{idx+1}/{len(train_loader)}] Batch Loss: {loss.item():.4f}")

        epoch_loss = total_loss / max(len(train_loader), 1)
        epoch_time = time.time() - start_time
        history["train_loss"].append(epoch_loss)
        history["epoch_times"].append(epoch_time)
        print(f"=== Epoch {epoch} Complete | Avg Loss: {epoch_loss:.4f} | Time: {epoch_time:.1f}s ===")

        # Save checkpoint
        checkpoint_file = os.path.join(checkpoint_dir, f"checkpoint_epoch_{epoch}.pth")
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "loss": epoch_loss,
            "vocab_size": len(vocab),
            "embed_dim": embed_dim,
            "hidden_dim": hidden_dim
        }, checkpoint_file)
        print(f"[+] Saved checkpoint to {checkpoint_file}")

    # Save final model
    final_path = os.path.join(checkpoint_dir, "resnet50_lstm_captioner.pth")
    torch.save({
        "model_state_dict": model.state_dict(),
        "vocab_size": len(vocab),
        "embed_dim": embed_dim,
        "hidden_dim": hidden_dim
    }, final_path)
    print(f"[+] Saved final production checkpoint to {final_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CNN-LSTM Image Captioning Model")
    parser.add_argument("--image_dir", type=str, default="data/flickr8k/Images")
    parser.add_argument("--captions_file", type=str, default="data/flickr8k/captions.txt")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=3e-4)
    args = parser.parse_args()
    
    train_model(
        image_dir=args.image_dir,
        captions_file=args.captions_file,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr
    )
