import logging
logger = logging.getLogger(__name__)

# =======================================================================
# Load Saved Models for Prosody & Pronunciation
# =======================================================================
# Loads a Single Model
def load_model(model_path):
    # Import joblib inside the function as it is only needed for this, no need to keep it loaded after
    import joblib
    return joblib.load(model_path)

# Load Prosody & Pronunciation Models
PROSODY_MODEL       = load_model("pronunciation_rf_v4")
PRONUNCIATION_MODEL = load_model(      "prosody_rf_v1")

logger.info("Loaded Prosody & Pronunciation Models")
