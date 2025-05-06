import numpy as np
import pandas as pd

import math
import re

from time import time
import logging


from .. import config as cf
from .biomarker_config import *

# Import biomarker calculation functions
from .biomarkers.pragmatic       import generate_pragmatic_score
from .biomarkers.altered_grammar import generate_altered_grammar_score
from .biomarkers.prosody         import generate_prosody_score
from .biomarkers.pronunciation   import generate_pronunciation_score
from .biomarkers.anomia          import generate_anomia_score
from .biomarkers.turntaking      import generate_turntaking_score



# =======================================================================
# Configure Logging
# =======================================================================
# Set up logger
logger = logging.getLogger(__name__)

# Mute the generate_grammar_score logs
logging.getLogger(".biomarker_models.altered_grammer").setLevel(logging.CRITICAL)


# Logging helpers
GREEN = "\033[0;32m"

prag = f"{GREEN}Pragmatic:      "
gram = f"{GREEN}Altered Grammar:"
pros = f"{GREEN}Prosody:        "
pron = f"{GREEN}Pronunciation:  "
anom = f"{GREEN}Anomia:         "
turn = f"{GREEN}Turntaking:     "






# =======================================================================
# Generate Each Biomarker Score
# =======================================================================
def generate_biomarker_scores(user_utt, conversation_start_time, LLM_response, prosody_features, prosody_model, pronunciation_features, pronunciation_model):
    biomarker_scores = {
        "pragmatic"     : 1.0 - generate_pragmatic_score      (user_utt, LLM_response                     ),
        "grammar"       : 1.0 - generate_altered_grammar_score(user_utt, conversation_start_time          ),
        "prosody"       : 1.0 - generate_prosody_score        (prosody_features,       prosody_model      ),
        "pronunciation" : 1.0 - generate_pronunciation_score  (pronunciation_features, pronunciation_model),
    }
    return biomarker_scores

def generate_periodic_scores(user_utterances, conversation_start_time, overlapped_speech_count):
    return {
        "anomia"     : 1.0 - generate_anomia_score    (user_utterances, conversation_start_time),
        "turntaking" : 1.0 - generate_turntaking_score(overlapped_speech_count)
    }

