from transformers import pipeline

class Summarizer:
    def __init__(self):
        self.model = None
        # Default roughly 1000 words per chunk to stay under model token limits (approx 1024 tokens)
        self.chunk_size = 800 

    def _ensure_model(self):
        if self.model is None:
            try:
                self.model = pipeline("summarization", model="google/pegasus-meeting")
            except Exception as e:
                print(f"Warning: pegasus-meeting failed ({e}), falling back to bart-large-cnn")
                self.model = pipeline("summarization", model="facebook/bart-large-cnn")

    def chunk_text(self, text: str) -> list:
        words = text.split()
        chunks = []
        for i in range(0, len(words), self.chunk_size):
            chunks.append(" ".join(words[i:i + self.chunk_size]))
        return chunks

    def _summarize_text(self, text: str) -> str:
        if not text.strip():
            return ""
        
        self._ensure_model()
        chunks = self.chunk_text(text)
        chunk_summaries = []
        
        for chunk in chunks:
            input_len = len(chunk.split())
            if input_len < 10:
                chunk_summaries.append(chunk)
                continue
                
            max_len = min(256, max(30, int(input_len * 0.8)))
            min_len = min(30, int(max_len * 0.4))
            
            try:
                res = self.model(chunk, max_length=max_len, min_length=min_len, do_sample=False)
                chunk_summaries.append(res[0]['summary_text'])
            except Exception as e:
                print(f"Summarization error on chunk: {e}")
                # Fallback to the original text for this chunk if something fails
                chunk_summaries.append(chunk)
                
        return " ".join(chunk_summaries)

    def summarize(self, full_text: str, segments: list) -> dict:
        overall_summary = self._summarize_text(full_text)
        
        by_topic = []
        for seg in segments:
            # Reconstruct text for segment
            seg_text = "\n".join([f"{t['speaker']}: {t['text']}" for t in seg['turns']])
            if seg_text.strip():
                seg_summary = self._summarize_text(seg_text)
                by_topic.append({
                    "topic": seg['topic'],
                    "summary": seg_summary
                })
                
        return {
            "overall": overall_summary,
            "by_topic": by_topic
        }
