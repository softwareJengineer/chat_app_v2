import logging
from .. import biomarker_config as BioConfig

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Altered Grammar Biomarker
# =======================================================================
from time import time
from .biomarker_models.altered_grammer import generate_grammar_score

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_altered_grammar_score(user_utt, conversation_start_time):
    current_duration = time() - conversation_start_time
    try:                   score = generate_grammar_score([user_utt], current_duration)
    except Exception as e: score = 1.0; logger.error(f"Error calculating altered grammar score: {e}"); 
    
    logger.info(f"{BioConfig.GRAM} {score:.4f}")
    return score

