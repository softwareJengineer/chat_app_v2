import logging
from .... import config as cf

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Load Saved Models for Prosody & Pronunciation
# =======================================================================
# --- Should probably move the model files out of /services and into this directory ---

# -----------------------------------------------------------------------
# Loads a Single Model
# -----------------------------------------------------------------------
def load_model(model_path):
    # Import joblib inside the function as it is only needed for this, no need to keep it loaded after
    import joblib

    # Load & Return the model at the given path
    return joblib.load(model_path)

# -----------------------------------------------------------------------
# Load Prosody & Pronunciation Models
# -----------------------------------------------------------------------
PROSODY_MODEL       = load_model(cf.      prosody_model_path)
PRONUNCIATION_MODEL = load_model(cf.pronunciation_model_path)

logger.info("Loaded Prosody & Pronunciation Models")
