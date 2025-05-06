import logging
from .. import biomarker_config as BioConfig

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Anomia Biomarker
# =======================================================================
import re
from time import time

# Filler words per minute
# --- This probably needs changing.... ---
def generate_anomia_score(user_utterances, conversation_start_time):
    # Find filler words used in the speech
    pattern = r'\b(u+h+|a+h+|u+m+|h+m+|h+u+h+|m+h+|h+m+|h+a+h+)\b'
    all_fillers = []
    for sentence in user_utterances:
        filler_words = re.findall(pattern, sentence, re.IGNORECASE)
        all_fillers.extend(filler_words)
    
    # Filler words per minute
    duration_minutes   = (time() - conversation_start_time) / 60
    fillers_per_minute = len(all_fillers) / duration_minutes if duration_minutes > 0 else 0
    anomia_score = min(fillers_per_minute / 10, 1)

    logger.info(f"{BioConfig.ANOM} {anomia_score:.4f}")
    return anomia_score