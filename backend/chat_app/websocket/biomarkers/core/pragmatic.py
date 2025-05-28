import logging

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Pragmatic Biomarker
# =======================================================================
import pandas as pd
import math
import os

from ..biomarker_models.coherence_function import coherence

# -----------------------------------------------------------------------
# Features for the Pragmatic Score
# -----------------------------------------------------------------------
current_path = os.path.dirname(os.path.abspath(__file__))
parent_path  = os.path.dirname(current_path) # (one level up)
bm_path      = f"{parent_path}/biomarker_models"

bm_vectors   = pd.read_csv  (f"{bm_path}/new_LSA.csv", index_col=0 )
bm_entropy   = pd.read_csv  (f"{bm_path}/Hoffman_entropy_53758.csv")
bm_stop_list = pd.read_table(f"{bm_path}/stoplist.txt", header=None)


# -----------------------------------------------------------------------
# Pragmatic Score
# -----------------------------------------------------------------------
# Uses saved models on given features (score defaults to 1.0 on error)
def generate_pragmatic_score(user_utt: str, llm_response: str):
    # Get a DataFrame for the given speech
    try:                   speech_df = get_speech_df(user_utt, llm_response)
    except Exception as e: logger.error(f"Error preparing speech data for coherence calculation: {e}"); return 1
    
    # Calculate the pragmatic score
    try:
        pragmatic_score = coherence(speech_df, vectors=bm_vectors, entropy=bm_entropy, stop_list=bm_stop_list)
        
        # Assuming pragmatic_score is a float
        if math.isnan(pragmatic_score):
            print("is nan condition pragmatic_score", pragmatic_score)
            pragmatic_score = 0

        # Adjusted pragmatic score
        adjusted_pragmatic_score = 0 if (pragmatic_score == 0) else (1.0 - pragmatic_score)
        return adjusted_pragmatic_score
    
    except Exception as e: logger.error(f"Error calculating pragmatic score: {e}"); return 1.0



# -----------------------------------------------------------------------
# Creates a DataFrame for the given speech
# -----------------------------------------------------------------------
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
    #print("new_speech_dict", new_speech_dict)    
    #logger.info(f"new_speech_dict conversation: {new_speech_dict}")
    
    # Create the speech DataFrame
    speech_df = pd.DataFrame(new_speech_dict)
    #logger.info(f"created new history speech dataframe: {speech_df}")

    return speech_df