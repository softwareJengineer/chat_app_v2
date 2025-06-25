# =======================================================================
# Altered Grammar Biomarker
# =======================================================================
from time import time
from ..biomarker_models.altered_grammer import generate_grammar_score

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_altered_grammar_score(context_buffer):
    # All of the users messages from the context buffer
    user_messages = [content for role, content, _ in context_buffer if role == "user"]

    # Earliest message timestamp (ToDo: this isn't exact enough, but whatever for now)
    current_duration = time() - context_buffer[0][2]

    score = generate_grammar_score(user_messages, current_duration)
    return score

