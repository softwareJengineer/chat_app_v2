import logging
from .. import biomarker_config as BioConfig

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Turntaking Biomarker
# =======================================================================

# Number of interruptions per X seconds of speech
def generate_turntaking_score(overlapped_speech_count, norm=10):
    normalized_score = min(overlapped_speech_count / norm, 1)
    logger.info(f"{BioConfig.TURN} {normalized_score:.4f}")
    return normalized_score
