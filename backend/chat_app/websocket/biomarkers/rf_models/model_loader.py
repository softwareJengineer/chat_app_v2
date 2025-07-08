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
rf_model_path = "/app/chat_app/websocket/biomarkers/rf_models"
PROSODY_MODEL       = load_model(f"{rf_model_path}/prosody_rf_v1.pkl"      )
PRONUNCIATION_MODEL = load_model(f"{rf_model_path}/pronunciation_rf_v4.pkl")

logger.info("Loaded Prosody & Pronunciation Models")
