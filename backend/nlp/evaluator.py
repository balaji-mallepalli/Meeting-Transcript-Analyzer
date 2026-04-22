from rouge_score import rouge_scorer

def evaluate_summary(generated: str, reference: str) -> dict:
    if not generated or not reference:
        return {"rouge1": 0.0, "rouge2": 0.0, "rougeL": 0.0}
        
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(reference, generated)
    
    return {
        "rouge1": scores['rouge1'].fmeasure,
        "rouge2": scores['rouge2'].fmeasure,
        "rougeL": scores['rougeL'].fmeasure
    }

def evaluate_extraction(predicted: list, ground_truth: list) -> dict:
    """
    Evaluates extraction based on overlap of sentences.
    predicted: list of string texts (either decisions or action items)
    ground_truth: list of string texts (reference definitions)
    Using string matching or simple token overlap for True Positive approximations.
    """
    if not ground_truth:
         return {"precision": 0.0, "recall": 0.0, "f1": 0.0}
         
    if not predicted:
         return {"precision": 0.0, "recall": 0.0, "f1": 0.0}

    # very simple Exact Match or substring match for TP
    tp = 0
    pred_cleaned = [p.lower().strip() for p in predicted]
    gt_cleaned = [g.lower().strip() for g in ground_truth]
    
    for p in pred_cleaned:
        # Check if the predicted string is substantially overlapping with any GT string
        for g in gt_cleaned:
            if p in g or g in p:
                tp += 1
                break # Only match each gt logic loosely once
                
    fp = len(predicted) - tp
    fn = len(ground_truth) - tp
    
    # Ensure no negative metrics (if overlap is weird)
    fp = max(0, fp)
    fn = max(0, fn)
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1
    }
