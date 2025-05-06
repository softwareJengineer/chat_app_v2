# =======================================================================
# Pronunciation Biomarker
# =======================================================================
from .utils.process_scores   import process_scores
from .rf_models.model_loader import PRONUNCIATION_MODEL

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_pronunciation_score(pronunciation_features, pronunciation_model=PRONUNCIATION_MODEL):
    return process_scores(pronunciation_features, pronunciation_model)[0]
