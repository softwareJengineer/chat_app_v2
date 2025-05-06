# =======================================================================
# Prosody Biomarker
# =======================================================================
from .utils.process_scores   import process_scores
from .rf_models.model_loader import PROSODY_MODEL

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_prosody_score(prosody_features, prosody_model=PROSODY_MODEL):
    return process_scores(prosody_features, prosody_model)[0]
