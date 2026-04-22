from transformers import pipeline
import math

class DecisionExtractor:
    def __init__(self):
        self.classifier = None
        self.candidate_labels = ["decision", "action item", "general discussion"]

    def _ensure_classifier(self):
        if self.classifier is None:
            self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

    def extract(self, turns: list) -> list:
        self._ensure_classifier()
        decisions = []
        
        for turn in turns:
            text = turn["text"].strip()
            if not text:
                continue
                
            res = self.classifier(text, self.candidate_labels)
            
            # Find score for "decision"
            try:
                decision_index = res["labels"].index("decision")
                score = res["scores"][decision_index]
                if score > 0.5:
                    decisions.append({
                        "speaker": turn["speaker"],
                        "decision": text,
                        "confidence": float(score)
                    })
            except ValueError:
                pass
                
        return decisions
