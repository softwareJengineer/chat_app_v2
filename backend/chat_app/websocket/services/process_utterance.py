# Imports
from ...                           import config as cf
from ..biomarkers.biomarker_config import LAST_X_CHAT_ENTRIES

# Logging
logger = cf.logging.getLogger("__asr__") # ---- why does this say ASR again??

# =======================================================================
# Helper Functions (for formatting the prompt)
# =======================================================================
# Formats a turn from the chat history for LLM input
def format_turn(turn):
    speaker = "user" if (turn["Speaker"] == "User") else "assistant"
    return f"\n<|{speaker}|>\n{turn['Utt']}<|end|>"

# Uses a set number of turns from the chat history to give context to the LLM
def prepare_LLM_input(user_utt, chat_history):
    # Only use the last X entries of the chat_history
    history = chat_history[-LAST_X_CHAT_ENTRIES:]

    # Start the LLM input string with the specified prompt defined during configuration
    LLM_input = f"<|system|>\n{cf.PROMPT}<|end|>"

    # Format the each turn in the history for LLM input & add them to the LLM input string
    LLM_input += "".join([format_turn(turn) for turn in history])

    # Finally, to complete the LLM input, add the most recent user's utterance & a tag for the LLM to respond            
    LLM_input += f"\n<|user|>\n{user_utt}<|end|>\n<|assistant|>\n"

    # Return the completed prompt
    return LLM_input


# =======================================================================
# Get a Response from the LLM
# =======================================================================
# Get the users most recent utterance, and the chat history object
async def get_LLM_response(LLM_input):
    # Wrap the response logic in a try-except block
    try:
        # Generate response using the LLM
        output = await cf.llm(LLM_input, max_tokens=cf.MAX_LENGTH, stop=["<|end|>", ".", "?"], echo=True)
        system_utt = (output['choices'][0]['text'].split("<|assistant|>")[-1]).strip()

    # If the model throws an error...
    except Exception as e:
        logger.error(f"Error in process_user_utterance: {e}")
        system_utt = "I'm sorry, I encountered an error while processing your request."

    return system_utt
