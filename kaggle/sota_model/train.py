"""
sota_model/train.py

Stratified 5-Fold fine-tuning loop for disaster tweet classification with out-of-fold evaluation.
"""

import os
import argparse
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.model_selection import StratifiedKFold
from transformers import AutoTokenizer, get_cosine_schedule_with_warmup

from sota_model.utils import seed_everything, format_context_prompt, compute_metrics, find_best_threshold
from sota_model.dataset import DisasterTweetDataset
from sota_model.model import DisasterTweetClassifier

def parse_args():
    parser = argparse.ArgumentParser(description="Train SOTA Transformer on Disaster Tweets")
    parser.add_argument("--model_name", type=str, default="microsoft/deberta-v3-small")
    parser.add_argument("--data_path", type=str, default="data/train.csv")
    parser.add_argument("--output_dir", type=str, default="checkpoints")
    parser.add_argument("--folds", type=int, default=5)
    parser.add_argument("--run_fold", type=int, default=None)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--weight_decay", type=float, default=0.01)
    parser.add_argument("--max_length", type=int, default=128)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()

def train_epoch(model, dataloader, optimizer, scheduler, criterion, device):
    model.train()
    total_loss = 0.0
    for batch in dataloader:
        optimizer.zero_grad()
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["labels"].to(device)
        token_type_ids = batch.get("token_type_ids")
        if token_type_ids is not None:
            token_type_ids = token_type_ids.to(device)

        logits = model(input_ids, attention_mask, token_type_ids)
        loss = criterion(logits, labels)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()
        total_loss += loss.item()
    return total_loss / len(dataloader)

def eval_epoch(model, dataloader, criterion, device):
    model.eval()
    total_loss = 0.0
    all_probs, all_targets = [], []
    with torch.no_grad():
        for batch in dataloader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)
            token_type_ids = batch.get("token_type_ids")
            if token_type_ids is not None:
                token_type_ids = token_type_ids.to(device)

            logits = model(input_ids, attention_mask, token_type_ids)
            loss = criterion(logits, labels)
            total_loss += loss.item()

            probs = torch.sigmoid(logits).cpu().numpy()
            all_probs.extend(probs)
            all_targets.extend(labels.cpu().numpy())

    all_probs = np.array(all_probs)
    all_targets = np.array(all_targets)
    best_thresh, best_f1 = find_best_threshold(all_targets, all_probs)
    metrics = compute_metrics(all_targets, (all_probs >= 0.5).astype(int))
    metrics["val_loss"] = total_loss / len(dataloader)
    metrics["best_thresh"] = best_thresh
    metrics["best_f1"] = best_f1
    return metrics, all_probs

def main():
    args = parse_args()
    seed_everything(args.seed)
    os.makedirs(args.output_dir, exist_ok=True)

    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
    print(f"[INFO] Using device: {device}")

    print(f"[INFO] Loading data from {args.data_path}...")
    df = pd.read_csv(args.data_path)
    df["prompt_text"] = [
        format_context_prompt(kw, loc, txt)
        for kw, loc, txt in zip(df["keyword"], df["location"], df["text"])
    ]

    try:
        tokenizer = AutoTokenizer.from_pretrained(args.model_name, local_files_only=True)
    except Exception:
        tokenizer = AutoTokenizer.from_pretrained(args.model_name)

    skf = StratifiedKFold(n_splits=args.folds, shuffle=True, random_state=args.seed)
    df["fold"] = -1
    for fold, (_, val_idx) in enumerate(skf.split(df, df["target"])):
        df.loc[val_idx, "fold"] = fold

    oof_probs = np.zeros(len(df))
    fold_f1_scores = []
    target_folds = [args.run_fold] if args.run_fold is not None else list(range(args.folds))
    criterion = nn.BCEWithLogitsLoss()

    for fold in target_folds:
        print(f"\n--- FOLD {fold + 1} / {args.folds} ---")
        train_sub = df[df["fold"] != fold].reset_index(drop=True)
        val_sub = df[df["fold"] == fold].reset_index(drop=True)
        val_indices = df[df["fold"] == fold].index.values

        train_dataset = DisasterTweetDataset(train_sub["prompt_text"], train_sub["target"], tokenizer, args.max_length)
        val_dataset = DisasterTweetDataset(val_sub["prompt_text"], val_sub["target"], tokenizer, args.max_length)

        train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=args.batch_size * 2, shuffle=False)

        model = DisasterTweetClassifier(model_name=args.model_name).to(device)

        no_decay = ["bias", "LayerNorm.weight"]
        optimizer_grouped_parameters = [
            {"params": [p for n, p in model.named_parameters() if not any(nd in n for nd in no_decay)], "weight_decay": args.weight_decay},
            {"params": [p for n, p in model.named_parameters() if any(nd in n for nd in no_decay)], "weight_decay": 0.0},
        ]
        optimizer = torch.optim.AdamW(optimizer_grouped_parameters, lr=args.lr)
        total_steps = len(train_loader) * args.epochs
        scheduler = get_cosine_schedule_with_warmup(optimizer, num_warmup_steps=int(total_steps * 0.1), num_training_steps=total_steps)

        best_val_f1 = -1.0
        best_fold_probs = None
        checkpoint_path = os.path.join(args.output_dir, f"model_fold_{fold}.pt")

        for epoch in range(args.epochs):
            train_loss = train_epoch(model, train_loader, optimizer, scheduler, criterion, device)
            val_metrics, val_probs = eval_epoch(model, val_loader, criterion, device)
            print(f"Epoch [{epoch + 1}/{args.epochs}] Train: {train_loss:.4f} | Val: {val_metrics['val_loss']:.4f} | F1: {val_metrics['f1']:.4f} | Best F1: {val_metrics['best_f1']:.4f}")

            if val_metrics["best_f1"] > best_val_f1:
                best_val_f1 = val_metrics["best_f1"]
                best_fold_probs = val_probs
                torch.save({"model_state_dict": model.state_dict(), "fold": fold, "val_f1": best_val_f1, "best_thresh": val_metrics["best_thresh"], "model_name": args.model_name}, checkpoint_path)

        fold_f1_scores.append(best_val_f1)
        oof_probs[val_indices] = best_fold_probs

    if args.run_fold is None:
        global_thresh, global_f1 = find_best_threshold(df["target"].values, oof_probs)
        print(f"\n[SUMMARY] Mean Fold F1: {np.mean(fold_f1_scores):.4f} +/- {np.std(fold_f1_scores):.4f}")
        print(f"[SUMMARY] Global Optimal Threshold: {global_thresh:.2f} | OOF F1: {global_f1:.4f}")
        with open(os.path.join(args.output_dir, "metadata.txt"), "w") as f:
            f.write(f"model_name: {args.model_name}\nmean_fold_f1: {np.mean(fold_f1_scores):.4f}\noptimal_threshold: {global_thresh:.2f}\noof_optimal_f1: {global_f1:.4f}\n")

if __name__ == "__main__":
    main()
