# =======================================================================
# ASR & TTS functionality using Azure
# =======================================================================
import numpy as np
import io

import time
import datetime

import azure.cognitiveservices.speech as speechsdk

from ... import config as cf

# =======================================================================
# Set API Keys & Logger
# =======================================================================
# Speech configuration
speech_key,    service_region = cf.speech_key,    cf.service_region
speech_config, audio_config   = cf.speech_config, cf.audio_config

# Logging
logger = cf.logging.getLogger("__asr__")

# =======================================================================
# Python version of AzureASR (work in progress... not ready to use)
# =======================================================================
speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, language=cf.THIS_LANGUAGE, audio_config=audio_config)

def transcribe_audio_array(audio_array, sample_rate, speech_config):
    try:
        # Convert float32 to int16 PCM (if not already int16)
        if audio_array.dtype != np.int16: audio_array = (audio_array * 32767).astype(np.int16)

        # Convert to bytes
        audio_bytes = audio_array.tobytes()

        # Create a stream and push the data
        stream = speechsdk.audio.PushAudioInputStream(
            stream_format=speechsdk.audio.AudioStreamFormat(
                samples_per_second=sample_rate, bits_per_sample=16, channels=1)
        )
        stream.write(audio_bytes)
        stream.close()  # No more data coming

        # Wrap in AudioConfig
        audio_config = speechsdk.audio.AudioConfig(stream=stream)

        # Create recognizer and run transcription
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        result = recognizer.recognize_once()

        # Return recognized text (or empty string if failed)
        if result.reason == speechsdk.ResultReason.RecognizedSpeech: return result.text
        else:                                                        return ""  # or maybe log details here

    except Exception as e:
        print(f"Error during ASR: {e}")
        return ""









































