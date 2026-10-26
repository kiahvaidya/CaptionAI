import math
from typing import List, Dict, Any
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
try:
    from nltk.translate.meteor_score import meteor_score
except ImportError:
    meteor_score = None

def compute_bleu_scores(reference_captions: List[List[str]], candidate_caption: List[str]) -> Dict[str, float]:
    """
    Computes BLEU-1, BLEU-2, BLEU-3, and BLEU-4 scores between reference captions and a candidate.
    Uses method4 smoothing to prevent 0 scores on short sequences.
    """
    smooth = SmoothingFunction().method4
    
    # BLEU-1 (unigram precision)
    b1 = sentence_bleu(reference_captions, candidate_caption, weights=(1.0, 0, 0, 0), smoothing_function=smooth)
    # BLEU-2 (bigram precision)
    b2 = sentence_bleu(reference_captions, candidate_caption, weights=(0.5, 0.5, 0, 0), smoothing_function=smooth)
    # BLEU-3 (trigram precision)
    b3 = sentence_bleu(reference_captions, candidate_caption, weights=(0.33, 0.33, 0.33, 0), smoothing_function=smooth)
    # BLEU-4 (4-gram precision)
    b4 = sentence_bleu(reference_captions, candidate_caption, weights=(0.25, 0.25, 0.25, 0.25), smoothing_function=smooth)
    
    return {
        "bleu1": round(b1 * 100, 2),
        "bleu2": round(b2 * 100, 2),
        "bleu3": round(b3 * 100, 2),
        "bleu4": round(b4 * 100, 2),
    }

def compute_meteor(reference_captions: List[List[str]], candidate_caption: List[str]) -> float:
    """Computes METEOR metric if nltk data is present, otherwise returns approximation based on unigram alignment."""
    if meteor_score is not None:
        try:
            return round(meteor_score(reference_captions, candidate_caption) * 100, 2)
        except Exception:
            pass
    # Fallback unigram harmonic mean approximation
    ref_words = set(w for ref in reference_captions for w in ref)
    cand_words = set(candidate_caption)
    overlap = len(ref_words.intersection(cand_words))
    if not cand_words or not ref_words:
        return 0.0
    prec = overlap / len(cand_words)
    rec = overlap / len(ref_words)
    if (prec + rec) == 0:
        return 0.0
    f_mean = (10 * prec * rec) / (rec + 9 * prec)
    return round(f_mean * 100, 2)

def evaluate_caption_batch(references: List[List[str]], candidates: List[str]) -> Dict[str, Any]:
    """
    Evaluates a batch of generated captions against ground truth references.
    """
    bleu1_list, bleu2_list, bleu3_list, bleu4_list, meteor_list = [], [], [], [], []
    
    for refs, cand in zip(references, candidates):
        ref_tokens = [r.lower().split() for r in refs]
        cand_tokens = cand.lower().split()
        
        bleus = compute_bleu_scores(ref_tokens, cand_tokens)
        bleu1_list.append(bleus["bleu1"])
        bleu2_list.append(bleus["bleu2"])
        bleu3_list.append(bleus["bleu3"])
        bleu4_list.append(bleus["bleu4"])
        
        m_score = compute_meteor(ref_tokens, cand_tokens)
        meteor_list.append(m_score)
        
    avg = lambda lst: round(sum(lst) / max(len(lst), 1), 2)
    return {
        "BLEU-1": avg(bleu1_list),
        "BLEU-2": avg(bleu2_list),
        "BLEU-3": avg(bleu3_list),
        "BLEU-4": avg(bleu4_list),
        "METEOR": avg(meteor_list),
        "sample_count": len(candidates)
    }
