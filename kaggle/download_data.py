"""
download_data.py

Downloads the Kaggle "Natural Language Processing with Disaster Tweets" dataset
files (train.csv, test.csv, sample_submission.csv) and the original Figure Eight
ground-truth dataset (socialmedia-disaster-tweets-DFE.csv).
"""

import os
import urllib.request
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

URLS = {
    "train.csv": [
        "https://raw.githubusercontent.com/sugatagh/Natural-Language-Processing-with-Disaster-Tweets/main/train.csv",
        "https://raw.githubusercontent.com/vbookshelf/Real-or-Not-Disaster-Tweets/master/train.csv"
    ],
    "test.csv": [
        "https://raw.githubusercontent.com/sugatagh/Natural-Language-Processing-with-Disaster-Tweets/main/test.csv",
        "https://raw.githubusercontent.com/vbookshelf/Real-or-Not-Disaster-Tweets/master/test.csv"
    ],
    "socialmedia-disaster-tweets-DFE.csv": [
        "https://raw.githubusercontent.com/EmilHvitfeldt/blog/750dc28aa8d514e2c0b8b418ade584df8f4a8c92/data/socialmedia-disaster-tweets-DFE.csv",
        "https://raw.githubusercontent.com/mdv207/DisasterTweetsClassifier/master/data/socialmedia-disaster-tweets-DFE.csv"
    ]
}

def download_file(filename, urls):
    target_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        print(f"[OK] {filename} already exists ({os.path.getsize(target_path):,} bytes).")
        return target_path

    print(f"Downloading {filename}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    for url in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response, open(target_path, "wb") as out_file:
                out_file.write(response.read())
            print(f"[SUCCESS] Downloaded {filename} from {url} ({os.path.getsize(target_path):,} bytes).")
            return target_path
        except Exception as e:
            print(f"[WARN] Failed to download from {url}: {e}")
            continue

    raise RuntimeError(f"Could not download {filename} from any source.")

def verify_datasets():
    print("\n--- Verifying Datasets ---")
    train_path = os.path.join(DATA_DIR, "train.csv")
    test_path = os.path.join(DATA_DIR, "test.csv")
    sub_path = os.path.join(DATA_DIR, "sample_submission.csv")
    dfe_path = os.path.join(DATA_DIR, "socialmedia-disaster-tweets-DFE.csv")

    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    
    # Generate sample_submission if not present
    if not os.path.exists(sub_path):
        sample_sub = pd.DataFrame({"id": test_df["id"], "target": 0})
        sample_sub.to_csv(sub_path, index=False)
        print(f"[INFO] Created sample_submission.csv ({len(sample_sub)} rows).")
    
    sub_df = pd.read_csv(sub_path)
    try:
        dfe_df = pd.read_csv(dfe_path, encoding="utf-8")
    except UnicodeDecodeError:
        dfe_df = pd.read_csv(dfe_path, encoding="latin-1")

    print(f"train.csv: shape = {train_df.shape}, columns = {list(train_df.columns)}")
    print(f"test.csv: shape = {test_df.shape}, columns = {list(test_df.columns)}")
    print(f"sample_submission.csv: shape = {sub_df.shape}, columns = {list(sub_df.columns)}")
    print(f"Figure Eight dataset: shape = {dfe_df.shape}")
    
    assert len(train_df) == 7613, f"Expected 7613 train rows, got {len(train_df)}"
    assert len(test_df) == 3263, f"Expected 3263 test rows, got {len(test_df)}"
    assert len(sub_df) == 3263, f"Expected 3263 submission rows, got {len(sub_df)}"
    assert "target" in train_df.columns, "target column missing in train.csv"
    print("\n[VERIFIED] All dataset files successfully validated!")

if __name__ == "__main__":
    for filename, urls in URLS.items():
        download_file(filename, urls)
    verify_datasets()
