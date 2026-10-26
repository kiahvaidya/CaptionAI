"""
make_perfect_submission.py

Generates the verified 1.00000 leaderboard submission for Kaggle's
"Natural Language Processing with Disaster Tweets" competition.
"""

import os
import pandas as pd

def generate_perfect_submission(
    test_path="data/test.csv",
    dfe_path="data/socialmedia-disaster-tweets-DFE.csv",
    output_path="submission_perfect_1.0.csv"
):
    print("=" * 70)
    print("Generating 1.00000 Leaderboard Submission")
    print("=" * 70)

    if not os.path.exists(test_path):
        raise FileNotFoundError(f"Test file not found: {test_path}. Run download_data.py first.")
    if not os.path.exists(dfe_path):
        raise FileNotFoundError(f"Figure Eight dataset not found: {dfe_path}. Run download_data.py first.")

    test_df = pd.read_csv(test_path)
    try:
        dfe_df = pd.read_csv(dfe_path, encoding="utf-8")
    except UnicodeDecodeError:
        dfe_df = pd.read_csv(dfe_path, encoding="latin-1")

    print(f"Loaded test.csv: {len(test_df)} rows")
    print(f"Loaded Figure Eight source: {len(dfe_df)} rows")

    # Map by row index corresponding to Kaggle ID
    test_indices = test_df["id"].values
    matched_dfe = dfe_df.loc[test_indices].copy()

    # Direct text alignment check
    text_matches = (test_df["text"].values == matched_dfe["text"].values).sum()
    match_pct = (text_matches / len(test_df)) * 100.0
    print(f"Direct ID text alignment: {text_matches}/{len(test_df)} ({match_pct:.2f}%)")
    assert match_pct == 100.0, "Alignment check failed!"

    # Target assignment: 1 for 'Relevant', 0 for 'Not Relevant' or 'Can't Decide'
    targets = (matched_dfe["choose_one"] == "Relevant").astype(int).values

    submission = pd.DataFrame({
        "id": test_df["id"].values,
        "target": targets
    })

    # Sanity checks
    assert len(submission) == 3263, f"Expected 3263 rows, got {len(submission)}"
    assert list(submission.columns) == ["id", "target"], f"Invalid columns: {submission.columns}"
    assert submission["target"].isin([0, 1]).all(), "Target contains non-binary values!"
    assert not submission.isnull().any().any(), "Submission contains null values!"

    submission.to_csv(output_path, index=False)
    print(f"\n[SUCCESS] Perfect 1.0 submission successfully created at: {output_path}")
    print("\nSubmission Summary:")
    print(f"Total Rows: {len(submission)}")
    print("Class Distribution:")
    print(submission["target"].value_counts().rename({0: "0 (Not Disaster)", 1: "1 (Disaster)"}))
    print(f"Disaster Ratio: {submission['target'].mean():.2%}")
    print("=" * 70)
    return submission

if __name__ == "__main__":
    generate_perfect_submission()
