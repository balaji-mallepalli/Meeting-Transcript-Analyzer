import nltk
from nltk.tokenize import TextTilingTokenizer
from transformers import pipeline

# Global zero-shot classifier for topic labeling (lazy loaded)
topic_classifier = None
CANDIDATE_TOPICS = [
    "Budget Discussion", "UI Review", "Next Steps", 
    "Project Planning", "Technical Architecture", 
    "Status Update", "HR & Resources", "General Discussion"
]

def segment_topics(turns: list) -> list:
    global topic_classifier
    
    text_blocks = [turn['text'] for turn in turns]
    full_text = "\n\n".join(text_blocks)
    
    try:
        # `w` and `k` might need adjustment depending on text length. 
        # Lowered `w` and `k` for short transcripts
        tt = TextTilingTokenizer(w=10, k=5)
        segments_raw = tt.tokenize(full_text)
    except Exception as e:
        print(f"Warning: TextTiling failed ({e}), falling back to single segment.")
        segments_raw = [full_text]
        
    segments = []
    turn_idx = 0
    num_turns = len(turns)
    
    for idx, seg_text in enumerate(segments_raw):
        seg_turns = []
        
        while turn_idx < num_turns:
            current_turn = turns[turn_idx]
            # Check overlap since exact match can fail due to tokenization whitespace changes
            turn_words = current_turn['text'].split()
            if not turn_words:
                turn_idx += 1
                continue
                
            # If the first few words of the turn are in the segment, consider it part of the segment
            snippet = " ".join(turn_words[:5])
            if snippet in seg_text:
                seg_turns.append(current_turn)
                turn_idx += 1
            else:
                # If we have some turns, break to next segment. 
                # If no turns matched yet, consume at least one to move forward.
                if not seg_turns:
                    seg_turns.append(current_turn)
                    turn_idx += 1
                break
                
        # Edge case: push any remaining to last segment
        if idx == len(segments_raw) - 1 and turn_idx < num_turns:
             seg_turns.extend(turns[turn_idx:])
             turn_idx = num_turns
            
        if seg_turns:
            # Generate short topic label
            # Lazy load classifier
            if topic_classifier is None:
                try:
                    topic_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
                except Exception as e:
                    print(f"Topic classifier load failed: {e}")
                    
            topic_label = f"Topic {idx + 1}"
            if topic_classifier:
                # Only use the first 500 chars to classify the topic
                topic_text = " ".join([t['text'] for t in seg_turns])[:500]
                try:
                    res = topic_classifier(topic_text, CANDIDATE_TOPICS)
                    topic_label = res['labels'][0]
                except Exception as e:
                    pass

            segments.append({
                "topic": topic_label,
                "turns": seg_turns
            })
            
    return segments
