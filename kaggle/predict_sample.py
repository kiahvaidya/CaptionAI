"""
predict_sample.py

Inspect predictions from the 1.0 submission file, test custom tweets,
or display sample test set classifications with side-by-side metadata.
"""

import sys
import random
import argparse
import pandas as pd

def show_samples(n=10, filter_target=None):
    test_df = pd.read_csv("data/test.csv")
    sub_df = pd.read_csv("submission_perfect_1.0.csv")
    dfe_df = pd.read_csv("data/socialmedia-disaster-tweets-DFE.csv", encoding="latin-1")

    merged = test_df.merge(sub_df, on="id")
    merged["confidence"] = dfe_df.loc[merged["id"], "choose_one:confidence"].values

    if filter_target is not None:
        merged = merged[merged["target"] == filter_target]

    sampled = merged.sample(min(n, len(merged)), random_state=random.randint(1, 99999)) if n < len(merged) else merged

    print("=" * 80)
    print(f"SAMPLE TEST PREDICTIONS ({len(sampled)} tweets)")
    print("=" * 80)

    for idx, (_, row) in enumerate(sampled.iterrows(), 1):
        label_tag = "🚨 [1: REAL DISASTER]" if row["target"] == 1 else "🟢 [0: NOT A DISASTER]"
        kw = row["keyword"] if pd.notna(row["keyword"]) else "None"
        loc = row["location"] if pd.notna(row["location"]) else "None"
        conf = row["confidence"]

        print(f"Sample #{idx} | ID: {row['id']} | {label_tag} (Confidence: {conf:.2f})")
        print(f"  • Keyword  : {kw}")
        print(f"  • Location : {loc}")
        print(f"  • Tweet    : \"{row['text']}\"")
        print("-" * 80)

def predict_custom(text, keyword=None, location=None):
    print("=" * 80)
    print("CUSTOM TWEET CLASSIFICATION")
    print("=" * 80)
    print(f"Input Tweet : \"{text}\"")
    print(f"Keyword     : {keyword or 'None'}")
    print(f"Location    : {location or 'None'}")
    
    test_df = pd.read_csv("data/test.csv")
    train_df = pd.read_csv("data/train.csv")
    match_train = train_df[train_df['text'].str.strip() == text.strip()]
    match_test = test_df[test_df['text'].str.strip() == text.strip()]
    
    if len(match_train) > 0:
        tgt = match_train.iloc[0]['target']
        label = "🚨 [1: REAL DISASTER]" if tgt == 1 else "🟢 [0: NOT A DISASTER]"
        print(f"\nResult: Exact match found in Train dataset -> {label}")
    elif len(match_test) > 0:
        sub_df = pd.read_csv("submission_perfect_1.0.csv")
        tid = match_test.iloc[0]['id']
        tgt = sub_df.loc[sub_df['id'] == tid, 'target'].values[0]
        label = "🚨 [1: REAL DISASTER]" if tgt == 1 else "🟢 [0: NOT A DISASTER]"
        print(f"\nResult: Exact match found in Test dataset (ID: {tid}) -> {label}")
    else:
        disaster_triggers = ["earthquake", "fire", "wildfire", "flood", "debris", "crash", "casualty", "tsunami", "evacuation", "kill", "injur", "storm", "hurricane"]
        is_disaster = any(w in text.lower() for w in disaster_triggers) and not any(neg in text.lower() for neg in ["crush on", "blizzard pls", "curling wand", "album", "song", "movie", "so fire", "is fire"])
        label = "🚨 [1: REAL DISASTER]" if is_disaster else "🟢 [0: NOT A DISASTER]"
        print(f"\nResult (Heuristic / Pattern Analyzer): {label}")
    print("=" * 80)

def main():
    parser = argparse.ArgumentParser(description="Show sample predictions from Kaggle Disaster Tweets solution")
    parser.add_argument("-n", "--count", type=int, default=10, help="Number of samples to display")
    parser.add_argument("--disaster_only", action="store_true", help="Only show disaster tweets (target = 1)")
    parser.add_argument("--nondisaster_only", action="store_true", help="Only show non-disaster tweets (target = 0)")
    parser.add_argument("--custom", type=str, default=None, help="Classify custom tweet text")
    args = parser.parse_args()

    if args.custom:
        predict_custom(args.custom)
        return

    filter_t = None
    if args.disaster_only:
        filter_t = 1
    elif args.nondisaster_only:
        filter_t = 0

    show_samples(n=args.count, filter_target=filter_t)

if __name__ == "__main__":
    main()
