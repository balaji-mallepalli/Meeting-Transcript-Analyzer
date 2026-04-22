import re
import re

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    nlp.add_pipe("coreferee")
except Exception as e:
    print(f"Warning: Could not load spacy/coreferee. Exception: {e}")
    nlp = None

def resolve_coreferences(text: str) -> str:
    if not nlp:
        return text

    doc = nlp(text)
    token_to_resolved_text = {}
    
    if hasattr(doc._, 'coref_chains') and doc._.coref_chains:
        for chain in doc._.coref_chains:
            first_mention = chain.mentions[0]
            first_mention_text = " ".join([doc[i].text for i in first_mention.root_index]) if hasattr(first_mention, 'root_index') else " ".join([doc[i].text for i in first_mention.token_indexes])

            for mention in chain.mentions[1:]:
                # Only replace single-token pronouns for simplicity
                if len(mention.token_indexes) == 1:
                    token_index = mention.token_indexes[0]
                    # Make sure it's a pronoun before replacing
                    if doc[token_index].pos_ == "PRON":
                        token_to_resolved_text[token_index] = first_mention_text
                        
    resolved_text_parts = []
    for i, token in enumerate(doc):
        if i in token_to_resolved_text:
            resolved_text_parts.append(token_to_resolved_text[i] + token.whitespace_)
        else:
            resolved_text_parts.append(token.text + token.whitespace_)
            
    return "".join(resolved_text_parts)

def parse_transcript(text: str):
    # Split text into speaker turns
    turns = []
    # Pattern to match "SpeakerName: text" or "Speaker Name: text"
    pattern = re.compile(r'^([A-Z][a-zA-Z\s]+):\s*(.*)', re.MULTILINE)
    
    lines = text.strip().split('\n')
    current_speaker = None
    current_text = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        match = pattern.match(line)
        if match:
            if current_speaker:
                turns.append({"speaker": current_speaker.strip(), "text": " ".join(current_text)})
            current_speaker = match.group(1)
            current_text = [match.group(2)]
        else:
            if current_speaker:
                current_text.append(line)
                
    if current_speaker:
        turns.append({"speaker": current_speaker.strip(), "text": " ".join(current_text)})

    return turns

def get_plain_text(turns: list) -> str:
    return "\n".join([f"{turn['speaker']}: {turn['text']}" for turn in turns])

def preprocess(text: str):
    # 1. Resolve coreferences
    resolved_text = resolve_coreferences(text)
    
    # 2. Parse transcript
    turns = parse_transcript(resolved_text)
    
    return turns, resolved_text
