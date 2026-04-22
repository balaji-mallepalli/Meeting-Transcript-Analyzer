from transformers import pipeline

class ActionExtractor:
    def __init__(self):
        self.classifier = None
        self.candidate_labels = ["action item", "decision", "general discussion"]
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = None

    def _ensure_classifier(self):
        if self.classifier is None:
            self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

    def extract(self, turns: list) -> list:
        self._ensure_classifier()
        action_items = []
        
        for turn in turns:
            text = turn["text"].strip()
            if not text:
                continue
                
            res = self.classifier(text, self.candidate_labels)
            
            try:
                action_index = res["labels"].index("action item")
                score = res["scores"][action_index]
                if score > 0.5:
                    deadline_str = ""
                    if self.nlp:
                        doc = self.nlp(text)
                        # Extract DATE and TIME entities
                        deadlines = [ent.text for ent in doc.ents if ent.label_ in ("DATE", "TIME")]
                        if deadlines:
                            deadline_str = " ".join(deadlines)
                            
                    action_items.append({
                        "speaker": turn["speaker"],
                        "action": text,
                        "deadline": deadline_str,
                        "confidence": float(score)
                    })
            except ValueError:
                pass
                
        return action_items
