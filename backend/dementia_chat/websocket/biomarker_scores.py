import numpy as np
import pandas as pd

import math
import re

from time import time
import logging

from .biomarker_models.altered_grammer    import generate_grammar_score
from .biomarker_models.coherence_function import coherence

# =======================================================================
# Constants & Logging Setup
# =======================================================================
from .. import config as cf
from biomarker_config import *

chunk_size = int(WINDOW_SIZE / HOP_LENGTH)

# Configure logging
logger = logging.getLogger(__name__)


# =======================================================================
# Process Scores (uses pretrained models)
# =======================================================================
# Seperate features in 5-second non-overlapping chunks
def get_chunks(features, chunk_size=chunk_size):
    return [features.iloc[i:i+chunk_size].values for i in range(0, len(features), chunk_size) if len(features.iloc[i:i+chunk_size]) == chunk_size]

# Reshape 3D data to 2D
def reshape_data(X):
    return X.reshape(X.shape[0], -1)

# Takes a classifier model and returns probability values
def get_probs(model, X):
    return model.predict_proba(X)[:,1]

# getting scores from file
def process_scores(features, model, chunk_size=chunk_size):
    # Seperate features in 5-second non-overlapping chunks & reshape 3D data to 2D
    chunks        = get_chunks(features, chunk_size)
    feature_array = reshape_data(np.array(chunks))

    print(f'\tOriginal features shape: {features.shape}')
    print(f'\tReshaped features shape: {feature_array.shape}')

    # Use the given classifier to get probability values
    scores = get_probs(model, feature_array)
    print(f"\tSCORES: {scores}\n")
    return scores


# =======================================================================
# Helper Functions
# =======================================================================
# Creates a DataFrame for the given speech --- used in generate_pragmatic_score()
def get_speech_df(user_utt, global_llm_response):
    # Split the sentence into words & flatten it
    utter_list  = [i.split() for i in list(user_utt)]
    words = [word for utt in utter_list for word in utt]

    # Get and flatten the list of LLM responses
    response_list = [i.split() for i in [global_llm_response]]
    resp_words = [word for resp in response_list for word in resp]

    # Create columns for "user" and "robot", repeated for each word
    user_column  = ['user' ] * sum(len(utt ) for utt  in utter_list   )
    robot_column = ['robot'] * sum(len(resp) for resp in response_list)

    # Prepare the speech data - 'user' or 'robot' repeated for each word in the sentence + words from the utterances
    new_speech_dict = {'V1': user_column+robot_column, 'V2': words+resp_words}
    print("new_speech_dict", new_speech_dict)    
    logger.info(f"new_speech_dict conversation: {new_speech_dict}")
    
    # Create the speech DataFrame
    speech_df = pd.DataFrame(new_speech_dict)
    logger.info(f"created new history speech dataframe: {speech_df}")

    return speech_df

# =======================================================================
# Biomarker Functions
# =======================================================================
# Pragmatic
def generate_pragmatic_score(user_utt, global_llm_response):
    # Get a DataFrame for the given speech
    try: speech_df = get_speech_df(user_utt, global_llm_response)
    except Exception as e:
        logger.error(f"Error preparing speech data for coherence calculation: {e}"); return 1
    
    # Calculate the pragmatic score
    try:
        pragmatic_score = coherence(speech_df, vectors=bm_vectors, entropy=bm_entropy, stop_list=bm_stop_list)
        
        # Assuming adjusted_pragmatic_score is a float
        if math.isnan(pragmatic_score):
            print("is nan condition pragmatic_score", pragmatic_score)
            pragmatic_score = 0

        # Adjusted pragmatic score
        if pragmatic_score != 0: adjusted_pragmatic_score = 1 - pragmatic_score
        else:                    adjusted_pragmatic_score = 0
        
        # Print/log the scores before returning the adjusted score
        print(f"pragmatic_score: {pragmatic_score}, adjusted_pragmatic_score: {adjusted_pragmatic_score}")
        logger.info(f"Generated Adj. Pragmatic Score: {adjusted_pragmatic_score}")
        return adjusted_pragmatic_score
    
    except Exception as e:
        logger.error(f"Error calculating pragmatic score: {e}"); return 1
        

# Altered Grammar
def generate_altered_grammar_score(user_utt, conversation_start_time):
    try:
        current_duration = time() - conversation_start_time
        altered_grammar_score = generate_grammar_score(list(user_utt), current_duration)
    except Exception as e: 
        logger.error(f"Error calculating altered grammar score: {e}"); return 1
    
    print("altered_grammar_score", altered_grammar_score)
    return altered_grammar_score


# Prosody
def generate_prosody_score(prosody_model):
    try: return process_scores(PROSODY_FEATURES, prosody_model)
    except Exception as e: logger.error(f"Error processing prosody features: {e}"); return 1


# Pronunciation
def generate_pronunciation_score(pronunciation_model):
    try: return process_scores(PRONUNCIATION_FEATURES, pronunciation_model)
    except Exception as e: logger.error(f"Error processing pronunciation features: {e}"); return 1


# Anomia
def generate_anomia_score(user_utterances, conversation_start_time):
    # Find filler words used in the speech
    pattern = r'\b(u+h+|a+h+|u+m+|h+m+|h+u+h+|m+h+|h+m+|h+a+h+)\b'
    all_fillers = []
    for sentence in user_utterances:
        filler_words = re.findall(pattern, sentence, re.IGNORECASE)
        all_fillers.extend(filler_words)
    
    # Filler words per minute
    duration_minutes   = (time() - conversation_start_time) / 60
    fillers_per_minute = len(all_fillers) / duration_minutes if duration_minutes > 0 else 0
    return min(fillers_per_minute / 10, 1)


# Turntaking
def generate_turntaking_score(overlapped_speech_count):
    normalized_score = min(overlapped_speech_count / 10, 1)
    return normalized_score


# =======================================================================
# Generate Each Biomarker Score
# =======================================================================
def generate_biomarker_scores(user_utt, conversation_start_time, prosody_model, pronunciation_model):
    return {
        "pragmatic"     : 1.0 - generate_pragmatic_score      (user_utt                         ),
        "grammar"       : 1.0 - generate_altered_grammar_score(user_utt, conversation_start_time),
        "prosody"       : 1.0 - generate_prosody_score        (prosody_model                    ),
        "pronunciation" : 1.0 - generate_pronunciation_score  (pronunciation_model              ),
    }

def generate_periodic_scores(user_utterances, conversation_start_time, overlapped_speech_count):
    return {
        "anomia"     : 1.0 - generate_anomia_score(user_utterances, conversation_start_time),
        "turntaking" : 1.0 - generate_turntaking_score(overlapped_speech_count)
    }

