""" 
=======================================================================
        Process the users message & reply with the LLM ASAP 
======================================================================= 
"""
import json, logging
logger = logging.getLogger(__name__)

from time     import time
from datetime import datetime, timezone

from ...                      import config        as cf
from ...services              import logging_utils as lu 
from  ..services.chatHelpers  import generate_LLM_response

ERROR_UTTERANCE = "I'm sorry, I encountered an error while processing your request."


# ======================================================================= ===================================
# Process the users message & reply with the LLM ASAP
# ======================================================================= ===================================
async def handle_transcription(data, msg_callback, send_callback, bio_callback):
    """ Takes three callbacks from the consumers object """
    t0 = time()
    
    # -----------------------------------------------------------------------
    # 1) Process the users message
    # -----------------------------------------------------------------------
    text = data["data"].lower()
    logger.info(f"{lu.MAGENTA}[LLM] User utt received:\n{text} {lu.RESET}")

    # Fire-and-forget DB write for the "user" message & update in-memory context
    context_buffer = await msg_callback(role="user", text=text, time=time())

    # -----------------------------------------------------------------------
    # 2) Get the LLMs response (awaited since it is the most important/longest process)
    # -----------------------------------------------------------------------
    t1 = time(); logger.info(f"{lu.MAGENTA}[LLM] Sending LLM request... {lu.RESET}")
    system_utt = await generate_LLM_response(context_buffer)
    t2 = time(); logger.info(f"{lu.MAGENTA}[LLM] LLM response received: (in {(t2-t1):.4f}) \n{system_utt} {lu.RESET}")

    # Immediately send the response back through the websocket
    await send_callback(json.dumps({'type': 'llm_response', 'data': system_utt, 'time': datetime.now(timezone.utc).strftime("%H:%M:%S")}))
    t3 = time(); logger.info(f"{lu.MAGENTA}[LLM] Response sent {(t3-t2):.4f}s ({(t3-t0):.4f}s total). {lu.RESET}")

    # -----------------------------------------------------------------------
    # 3) Background persistence & biomarkers
    # -----------------------------------------------------------------------
    # Fire-and-forget DB write for the "assistant" message & update in-memory context
    context_buffer = msg_callback(role="assistant", text=system_utt, time=time())

    # On-utterance biomarker scores (could also use the context buffer here)
    bio_callback()



# ======================================================================= ===================================
# Generate LLM Response
# ======================================================================= ===================================
async def generate_LLM_response(context_buffer):
    """
    Original stop characters included punctuation (but not all? '!')...
        stop=["<|end|>", ".", "?"]

    Wrap the response logic in a try-except block. If the model throws an error, return a default response.
    """
    # 1) Prepare a prompt for the LLM
    full_prompt = prepare_LLM_input(context_buffer)
    LLM_start_time = time()

    # 2) Get a response from the LLM (hosted on a webserver)
    try:
        output = await cf.llm(full_prompt, max_tokens=cf.MAX_LENGTH, stop=["<|end|>", "\n"], echo=True) 
        system_utt = (output["choices"][0]["text"].split("<|assistant|>")[-1]).strip()

    except Exception as e: 
        logger.error(f"Error in get_LLM_response: {e}"); 
        system_utt = ERROR_UTTERANCE

    # 3) Log the response time and return
    logger.info(f"{lu.MAGENTA}[LLM] Received response in:    {(time() - LLM_start_time):6.4f}s {lu.MAGENTA}")
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
