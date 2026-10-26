"""
sota_model/inference.py

Generates ensemble test predictions from trained fold checkpoints.
"""

import os
import glob
import argparse
import numpy as np
import pandas as pd
import torch
from torch.utils.data import DataLoader
from transformers import AutoTokenizer

from sota_model.utils import format_context_prompt
from sota_model.dataset import DisasterTweetDataset
from sota_model.model import DisasterTweetClassifier

def parse_args():
    parser = argparse.ArgumentParser(description="Inference with trained SOTA ensemble")
    parser.add_argument("--test_path", type=str, default="data/test.csv")
    parser.add_argument("--checkpoint_dir", type=str, default="checkpoints")
    parser.add_argument("--output_path", type=str, default="submission_sota_transformer.csv")
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--threshold", type=float, default=None)
    parser.add_argument("--max_length", type=int, default=128)
    return parser.parse_args()

def predict_dataloader(model, dataloader, device):
    model.eval()
    all_probs = []
    with torch.no_grad():
        for batch in dataloader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            token_type_ids = batch.get("token_type_ids")
            if token_type_ids is not None:
                token_type_ids = token_type_ids.to(device)
            logits = model(input_ids, attention_mask, token_type_ids)
            probs = torch.sigmoid(logits).cpu().numpy()
            all_probs.extend(probs)
    return np.array(all_probs)

def main():
    args = parse_args()
    checkpoint_files = sorted(glob.glob(os.path.join(args.checkpoint_dir, "model_fold_*.pt")))
    if not checkpoint_files:
        raise FileNotFoundError(f"No checkpoint files found in {args.checkpoint_dir}.")

    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")

    first_ckpt = torch.load(checkpoint_files[0], map_location="cpu")
    model_name = first_ckpt.get("model_name", "microsoft/deberta-v3-small")

    test_df = pd.read_csv(args.test_path)
    test_df["prompt_text"] = [
        format_context_prompt(kw, loc, txt)
        for kw, loc, txt in zip(test_df["keyword"], test_df["location"], test_df["text"])
    ]

    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
    except Exception:
        tokenizer = AutoTokenizer.from_pretrained(model_name)

    test_dataset = DisasterTweetDataset(test_df["prompt_text"], labels=None, tokenizer=tokenizer, max_length=args.max_length)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False)

    ensemble_probs = np.zeros(len(test_df))
    for idx, ckpt_path in enumerate(checkpoint_files):
        ckpt = torch.load(ckpt_path, map_location=device)
        model = DisasterTweetClassifier(model_name=model_name).to(device)
        model.load_state_dict(ckpt["model_state_dict"])
        fold_probs = predict_dataloader(model, test_loader, device)
        ensemble_probs += fold_probs / len(checkpoint_files)

    threshold = args.threshold or 0.50
    binary_preds = (ensemble_probs >= threshold).astype(int)
    submission = pd.DataFrame({"id": test_df["id"].values, "target": binary_preds})
    submission.to_csv(args.output_path, index=False)
    print(f"[SUCCESS] Saved ensemble predictions to {args.output_path}")

if __name__ == "__main__":
    main()
