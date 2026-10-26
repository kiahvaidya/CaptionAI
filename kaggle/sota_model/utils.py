"""
sota_model/utils.py

Text cleaning, feature conditioning, metric computation, and seed utilities.
"""

import html
import re
import random
import numpy as np
import torch
from sklearn.metrics import f1_score, accuracy_score, precision_score, recall_score

def seed_everything(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    if torch.backends.mps.is_available():
        torch.mps.manual_seed(seed)

def clean_text(text: str) -> str:
    """Cleans tweet text while preserving disaster semantic meaning."""
    if not isinstance(text, str):
        return ""
    text = html.unescape(text)
    text = re.sub(r"https?://\S+|www\.\S+", "[URL]", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def clean_keyword(keyword) -> str:
    if pd_isna(keyword):
        return "none"
    kw = str(keyword).replace("%20", " ").strip().lower()
    return kw if kw else "none"

def clean_location(location) -> str:
    if pd_isna(location):
        return "none"
    loc = str(location).strip()
    return loc if loc else "none"

def pd_isna(val) -> bool:
    if val is None:
        return True
    if isinstance(val, float) and np.isnan(val):
        return True
    if isinstance(val, str) and val.strip().lower() in ["", "nan", "none"]:
        return True
    return False

def format_context_prompt(keyword, location, text: str) -> str:
    kw = clean_keyword(keyword)
    loc = clean_location(location)
    cleaned_t = clean_text(text)
    return f"Keyword: {kw} | Location: {loc} | Tweet: {cleaned_t}"

def compute_metrics(y_true, y_pred):
    return {
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
    }

def find_best_threshold(y_true, y_probs):
    best_thresh = 0.50
    best_f1 = -1.0
    thresholds = np.linspace(0.1, 0.9, 81)
    for t in thresholds:
        preds = (y_probs >= t).astype(int)
        score = f1_score(y_true, preds, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_thresh = t
    return float(best_thresh), float(best_f1)
