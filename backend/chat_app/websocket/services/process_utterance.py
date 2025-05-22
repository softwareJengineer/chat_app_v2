# Imports
from ...                           import config as cf
from ..biomarkers.biomarker_config import LAST_X_CHAT_ENTRIES

# =======================================================================
# Set API Keys & Logger
# =======================================================================
# Speech configuration
#speech_key,    service_region = cf.speech_key,    cf.service_region
#speech_config, audio_config   = cf.speech_config, cf.audio_config

# Logging
logger = cf.logging.getLogger("__asr__") # ---- why does this say ASR again??

# Process an Utterance
def process_user_utterance(user_utt: str, chat_history):
    try:
        # Generate response using the LLM
        system_utt = respond_to_user_utt(user_utt, chat_history)

    except Exception as e:
        logger.error(f"Error in process_user_utterance: {e}")
        system_utt = "I'm sorry, I encountered an error while processing your request."

    return system_utt


# =======================================================================
# Response Selection
# =======================================================================
# Helper function for formatting each turn in the chat history for LLM input
def format_turn(turn):
    speaker = "user" if (turn["Speaker"] == "User") else "assistant"
    return f"\n<|{speaker}|>\n{turn['Utt']}<|end|>"

# Helper function to prepare the LLM input text
# (uses a set amount of the chat history to give context to the LLM)
def prepare_LLM_input(user_utt, chat_history):
    # Only use the last X entries of the chat_history
    history = chat_history[-LAST_X_CHAT_ENTRIES:]
    #logger.info("history: " + str(history))
    
    # Start the LLM input string with the specified prompt from configuration
    LLM_input = f"<|system|>\n{cf.prompt}<|end|>"

    # Format the each turn in the history for LLM input & add them to the LLM input string
    LLM_input += "".join([format_turn(turn) for turn in history])

    # Finally, to complete the LLM input, add the most recent user's utterance & a tag for the LLM to respond            
    LLM_input += f"\n<|user|>\n{user_utt}<|end|>\n<|assistant|>\n"
    #logger.info("input_text: " + LLM_input)

    # Return the completed prompt
    return LLM_input

# -----------------------------------------------------------------------
# Response selection based on the ASR result
# -----------------------------------------------------------------------
def respond_to_user_utt(user_utt, chat_history):
    try:
        # Get an input string to give the LLM
        LLM_input = prepare_LLM_input(user_utt, chat_history)
        
        # Get output text from the LLM
        output = cf.llm(LLM_input, max_tokens=cf.max_length, stop=["<|end|>", ".", "?"], echo=True)
        system_utt = (output['choices'][0]['text'].split("<|assistant|>")[-1]).strip()

        # Synthesize the utterance into audio output (text-to-speech)
        #if cf.USE_CLOUD: tts.synthesize_utt(system_utt)
        #else: print(f"TESTING MODE: Skipping TTS. Response would have been: {system_utt}")
        return system_utt

    # If error occurs, write down the error at the logs/dm.log file
    except Exception as err:
        logger.error("user input parsing failed " + str(err))
