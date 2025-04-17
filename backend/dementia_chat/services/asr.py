import sys
import keyboard
import re
import azure.cognitiveservices.speech as speechsdk
import csv
import time
import datetime

# Imports
import config as cf
import dementia_chat.services.tts as tts

# =======================================================================
# Set API Keys & Logger
# =======================================================================
# Speech configuration
speech_key,    service_region = cf.speech_key,    cf.service_region
speech_config, audio_config   = cf.speech_config, cf.audio_config

# Logging
logger = cf.logging.getLogger("__asr__")

# =======================================================================
# Save the Chat History
# =======================================================================
# Saves the chat history as we go
def record_chat():
    # Restart or append to current
    mode = "w" if cf.script_check == 1 else "a"

    with open(cf.script_path, encoding="utf-8-sig", newline='', mode=mode) as f:
        writer = csv.writer(f)

        # Write headers if needed
        if cf.script_check == 1: writer.writerow(['Speaker', 'Utt', 'Time'])
        
        # Make sure the chat history is in chronological order & write the most recent entry
        cf.chat_history.sort(key=lambda x: x['Time'])
        writer.writerow(cf.chat_history[-1].values())
    
    cf.script_check += 1

# =======================================================================
# ASR Function
# =======================================================================
class listen_micr:
    # Configuration used in respond_to_user_utt()
    last_X_chat_entries = 6

    # Initialize
    def __init__(self): 
        self._running = True

    def terminate(self):
        self._running = False

    # =======================================================================
    # Helper Functions
    # =======================================================================
    # Helper function for saving utterances to the overall chat history
    def save_to_chat_history(self, user_utt, utt_start_time):
        # Format the given utterance & time string
        user_utt = re.sub(r'[^a-zA-Z ]', '', user_utt).lower()
        start_time = str(datetime.timedelta(seconds=utt_start_time)).split(".")[0]
        
        # Save it 
        one_turn_history = {'Speaker': 'User', 'Utt': user_utt, 'Time': start_time}
        cf.chat_history.append(one_turn_history)

        # Record it
        record_chat()

    # Once an utterance is received from the user, process it and respond
    def process_utterance_and_respond(self, user_utt):
        # Ignore punctuation marks and lower all words (ex: I eat foods. -> I eat foods (ignore punctuation) -> i eat foods (lower words))
        user_utt = user_utt[:-1].lower()

        # Time that the utterance was recognized
        utt_start_time = round((time.time() - cf.game_start_time), 5)
        
        # Print the result to see how the recognizer recognizes
        print("Recognized: {}".format(user_utt))
        logger.info('user said: ' + user_utt)
        
        # Respond to the user
        self.respond_to_user_utt(user_utt, cf.chat_history)

        # Save the utterance in our chat history
        self.save_to_chat_history(user_utt, utt_start_time)

        # Force to shut down ASR only (pressing ctrl + z shut down ASR)
        if ('exit' in user_utt) or ('종료' in user_utt) or (keyboard.is_pressed('esc')):
            print("Exiting...")
            sys.exit()
    
    # Helper function for handling exceptions
    def handle_asr_result_errors(self, result):
        # MS Azure recognizer errors are written below as exception
        try:
            if result.reason == speechsdk.ResultReason.NoMatch:
                logger.info("No speech could be recognized: {}".format(result.no_match_details))

            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                logger.info("Speech Recognition canceled: {}".format(cancellation_details.reason))

                if cancellation_details.reason == speechsdk.CancellationReason.Error:
                    logger.info("Error details: {}".format(cancellation_details.error_details))
        
        # If the error source was something else
        except Exception as e:
            logger.warning(f"Unexpected error during ASR result handling: {e}")

    # =======================================================================
    # Main Loop: Listen for the user's speech and respond
    # =======================================================================
    def run(self):
        """
        # Sample codes could be checked
        # https://github.com/Azure-Samples/cognitive-services-speech-sdk/blob/master/quickstart/python/from-microphone/quickstart.py
        # https://github.com/Azure-Samples/cognitive-services-speech-sdk/blob/a5de28baa82f2633d38e2acd49a319b9df2104c3/samples/python/console/speech_sample.py#L225
        """
        # Set up speech recognizer (Currently using MS Azure)
        if cf.USE_CLOUD:
            speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, language=cf.THIS_LANGUAGE, audio_config=audio_config)

        # Listening for speech
        while self._running:
            try:
                # If using the provided speech recognition service
                if cf.USE_CLOUD:
                    # Listen for speech from the user
                    record_ongoing = speech_recognizer.recognize_once_async()
                    logger.debug('listening ...')

                    # Inform a person to know start of recognition
                    print("Say Something!")

                    # Get the utterance generated from the speech SDK
                    result   = record_ongoing.get()
                    user_utt = result.text

                # If testing, just use default values
                else:
                    print("TESTING MODE: Generating fake user utterance... (sleeping for 2s)")
                    time.sleep(2)  # (simulate processing time)

                    # Testing utterance (change later to read from a testing script file)
                    user_utt = "test utterance from the user "

                # Process the utterance (if one was received)
                if user_utt: self.process_utterance_and_respond(user_utt)

            # If error occurs, pass and do the recognition task again
            except Exception as e:
                if cf.USE_CLOUD:
                    try: self.handle_asr_result_errors(result)
                    except NameError: logger.warning("Speech recognition failed before result was created.")
                # Testing mode
                else: logger.warning(f"Testing mode ASR error: {e}")
                pass

    # =======================================================================
    # Response Selection
    # =======================================================================
    # Helper function for formatting each turn in the chat history for LLM input
    def format_turn(self, turn):
        speaker = "user" if (turn["Speaker"] == "User") else "assistant"
        return f"\n<|{speaker}|>\n{turn['Utt']}<|end|>"
    
    # Helper function to prepare the LLM input text
    # (uses a set amount of the chat history to give context to the LLM)
    def prepare_LLM_input(self, user_utt, chat_history):
        # Only use the last X entries of the chat_history
        history = chat_history[-self.last_X_chat_entries:]
        logger.info("history: " + str(history))
        
        # Start the LLM input string with the specified prompt from configuration
        LLM_input = f"<|system|>\n{cf.prompt}<|end|>"

        # Format the each turn in the history for LLM input & add them to the LLM input string
        LLM_input += "".join([self.format_turn(turn) for turn in history])

        # Finally, to complete the LLM input, add the most recent user's utterance & a tag for the LLM to respond            
        LLM_input += f"\n<|user|>\n{user_utt}<|end|>\n<|assistant|>\n"
        logger.info("input_text: " + LLM_input)

        # Return the completed prompt
        return LLM_input

    # -----------------------------------------------------------------------
    # Response selection based on the ASR result
    # -----------------------------------------------------------------------
    def respond_to_user_utt(self, user_utt, chat_history):
        try:
            # Get an input string to give the LLM
            LLM_input = self.prepare_LLM_input(user_utt, chat_history)
            
            # Get output text from the LLM
            output = cf.llm(LLM_input, max_tokens=cf.max_length, stop=["<|end|>", ".", "?"], echo=True)
            system_utt = (output['choices'][0]['text'].split("<|assistant|>")[-1]).strip()

            # Synthesize the utterance into audio output (text-to-speech)
            if cf.USE_CLOUD: tts.synthesize_utt(system_utt)
            else: print(f"TESTING MODE: Skipping TTS. Response would have been: {system_utt}")

        # If error occurs, write down the error at the logs/dm.log file
        except Exception as err:
            logger.error("user input parsing failed " + str(err))