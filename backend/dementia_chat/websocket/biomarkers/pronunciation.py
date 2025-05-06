import logging
from .. import biomarker_config as BioConfig

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Pronunciation Biomarker
# =======================================================================
from .utils.process_scores   import process_scores
from .rf_models.model_loader import PRONUNCIATION_MODEL

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_pronunciation_score(pronunciation_features, pronunciation_model=PRONUNCIATION_MODEL):
    try:                   score = process_scores(pronunciation_features, pronunciation_model)[0]
    except Exception as e: score = 1.0; logger.error(f"Error processing pronunciation features: {e}")
    
    logger.info(f"{BioConfig.PRON} {score:.4f}")
    return score