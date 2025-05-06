import logging
from .... import config as cf

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Process Scores
# =======================================================================
# Utility functions for biomarkers calculated using pretrained models
import numpy as np
import pandas as pd

from ... import biomarker_config as BioConfig

# Default chunk size (calculated from constants defined in biomarker_config.py)
CHUNK_SIZE = int(BioConfig.WINDOW_SIZE / BioConfig.HOP_LENGTH)

# -----------------------------------------------------------------------
# Function Definitions
# -----------------------------------------------------------------------
# Seperate features in X-second non-overlapping chunks (X seconds defined in biomarker_config.py)
def get_chunks(features, chunk_size=CHUNK_SIZE):
    return [features.iloc[i:i+chunk_size].values for i in range(0, len(features), chunk_size) if len(features.iloc[i:i+chunk_size]) == chunk_size]

# Reshape 3D data to 2D
def reshape_data(X):
    return X.reshape(X.shape[0], -1)

# Takes a classifier model and returns probability values
def get_probs(model, X):
    return model.predict_proba(X)[:, 1]

# Get biomarker scores using saved model files 
def process_scores(features, model, chunk_size=CHUNK_SIZE):
    # Seperate features in X-second non-overlapping chunks & reshape 3D data to 2D
    chunks        = get_chunks(features, chunk_size)
    feature_array = reshape_data(np.array(chunks))

    # Use the given classifier model to get probability values
    scores = get_probs(model, feature_array)
    return scores