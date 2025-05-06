import logging
from .. import biomarker_config as BioConfig

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Prosody Biomarker
# =======================================================================
from .utils.process_scores   import process_scores
from .rf_models.model_loader import PROSODY_MODEL

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_prosody_score(prosody_features, prosody_model=PROSODY_MODEL):
    try:                   score = process_scores(prosody_features, prosody_model)[0]
    except Exception as e: score = 1.0; logger.error(f"Error processing prosody features: {e}")
    
    logger.info(f"{BioConfig.PROS} {score:.4f}")
    return score