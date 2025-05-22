# =======================================================================
# Altered Grammar Biomarker
# =======================================================================
from time import time
from ..biomarker_models.altered_grammer import generate_grammar_score

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_altered_grammar_score(user_utt, conversation_start_time):
    current_duration = time() - conversation_start_time
    score = generate_grammar_score([user_utt], current_duration)
    return score

