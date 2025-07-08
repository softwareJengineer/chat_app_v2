# =======================================================================
# Anomia Biomarker
# =======================================================================
import re
from time import time

# Filler words per minute
def generate_anomia_score(context_buffer):
    # 1) Get all of the users messages from the context buffer & the earliest message timestamp 
    # (ToDo: this isn't exact enough, but whatever for now) (also this and grammar both use this logic, should maybe combine somehow)
    user_messages    = [content for role, content, _ in context_buffer if role == "user"]
    current_duration = time() - context_buffer[0][2]

    # 2) Find filler words used in the speech
    pattern = r'\b(u+h+|a+h+|u+m+|h+m+|h+u+h+|m+h+|h+m+|h+a+h+)\b'
    all_fillers = []
    for sentence in user_messages:
        filler_words = re.findall(pattern, sentence, re.IGNORECASE)
        all_fillers.extend(filler_words)
    
    # 3) Filler words per minute
    duration_minutes   = current_duration / 60
    fillers_per_minute = len(all_fillers) / duration_minutes if duration_minutes > 0 else 0
    anomia_score       = min(fillers_per_minute / 10, 1)

    return anomia_score