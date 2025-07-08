
from time import time
from ...  import config as cf

from ..biomarkers.biomarker_config import LAST_X_CHAT_ENTRIES
# history = chat_history[-LAST_X_CHAT_ENTRIES:]

logger = cf.logging.getLogger("__asr__") # ---- why does this say ASR again??

# ======================================================================= ===================================
# LLM Helpers
# ======================================================================= ===================================
ERROR_UTTERANCE = "I'm sorry, I encountered an error while processing your request."

# Generate LLM Response
async def generate_LLM_response(context_buffer):
    """
    Original stop characters included punctuation (but not all? '!')...
        stop=["<|end|>", ".", "?"]
    """
    # -----------------------------------------------------------------------
    # 1) Prepare a prompt for the LLM
    # -----------------------------------------------------------------------
    full_prompt = prepare_LLM_input(context_buffer)

    # -----------------------------------------------------------------------
    # 2) Get a response from the LLM (hosted on a webserver)
    # -----------------------------------------------------------------------
    LLM_start_time = time()

    # Wrap the response logic in a try-except block. If the model throws an error, return a default response.
    try:
        output = await cf.llm(full_prompt, max_tokens=cf.MAX_LENGTH, stop=["<|end|>"], echo=True) # 
        system_utt = (output["choices"][0]["text"].split("<|assistant|>")[-1]).strip()

    except Exception as e: logger.error(f"Error in get_LLM_response: {e}"); system_utt = ERROR_UTTERANCE

    # -----------------------------------------------------------------------
    # 3) Log the response time and return
    # -----------------------------------------------------------------------
    logger.info(f"{cf.CYAN}[LLM] Received response in:    {(time() - LLM_start_time):6.4f}s {cf.RESET}")
    
    return system_utt

# -----------------------------------------------------------------------
# Helpers for preparing the input message
# -----------------------------------------------------------------------
# Formats a turn from the chat history for LLM input
def format_turn(turn): return f"\n<|{turn[0]}|>\n{turn[1]}<|end|>"

# Use a set number of turns from the chat history to give context to the LLM
def prepare_LLM_input(context_buffer):
    """
    1) Start the LLM input string with the specified prompt defined during configuration
    2) Format the each turn in the history (context_buffer) for LLM input & add them to the LLM input string
    3) Finally, complete the LLM input; add a tag for the LLM to respond & return the completed prompt
    """
    LLM_input  = f"<|system|>\n{cf.PROMPT}<|end|>"
    LLM_input += "".join([format_turn(turn) for turn in context_buffer])
    LLM_input += f"\n<|assistant|>\n"
    return LLM_input
