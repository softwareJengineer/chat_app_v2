import base64
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from time import time
import logging
from collections import deque
import pandas as pd
import asyncio
import numpy as np
import opensmile

import uuid
import librosa
from datetime import datetime, timezone
from django.apps import apps
from channels.db import database_sync_to_async
from .. import config as cf

# =======================================================================
# Imports, Constants, Logging, and openSMILE
# =======================================================================
from .biomarker_config  import *
from .biomarker_scores  import generate_biomarker_scores, generate_periodic_scores
from .process_utterance import respond_to_user_utt 

# Configure logging
logger = logging.getLogger(__name__)

# Initialize feature extractor
feature_extractor = opensmile.Smile(
    feature_set=opensmile.FeatureSet.ComParE_2016,
    feature_level=opensmile.FeatureLevel.LowLevelDescriptors,
    sampling_rate=SAMPLE_RATE,
)


# =======================================================================
# Processes incoming messages, scores them, and responds
# =======================================================================
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.client_id = id(self)
        try:
            # Verify LLM is initialized
            if not cf.llm: raise RuntimeError("LLM not initialized")

            # Rest of connect code...
            self.Chat = apps.get_model('dementia_chat', 'Chat')
            self.chatID = str(uuid.uuid4())

            # Features
            self.conversation_start_time = time()
            self.user_utterances         = deque(maxlen=100)
            self.overlapped_speech_count = 5 # --- should start at 0, but im testing it
            self.chat_history            = []  # Add chat_history as instance variable

            await self.accept()

            # Periodic scores asynchronous task
            self.periodic_scores_task   = asyncio.create_task(self.send_periodic_scores())

            # Features & models for Prosody and Pronunciation (periodic biomarkers)
            self.prosody_features       = None
            self.pronunciation_features = None
            

        except Exception as e:
            logger.error(f"Failed to initialize consumer: {e}"); return

    # --------------------------------------------------------------------
    # Disconnect
    # --------------------------------------------------------------------
    async def disconnect(self, close_code):
        if hasattr(self, 'periodic_scores_task'):
            self.periodic_scores_task.cancel()
            try: await self.periodic_scores_task
            except asyncio.CancelledError: logger.info("Periodic scores task successfully cancelled.")

        self.conversation_start_time = None
        self.user_utterances.clear()
        self.overlapped_speech_count = 0
        
        logger.info(f"Client disconnected: {self.client_id}")
        

    @database_sync_to_async
    def store_chat(self, user, date, time, scores, avgScores, notes, messages):
        """Store utterance in database asynchronously"""
        try:
            self.Chat.objects.create(
                chatID=self.chatID,
                user=user,
                date=date,
                time=time,
                scores=scores,
                avgScores=avgScores,
                notes=notes,
                messages=messages
            )
        except Exception as e:
            logger.error(f"Failed to store chat: {e}")


    # =======================================================================
    # Process an Utterance
    # =======================================================================
    def process_user_utterance(self, user_utt):
        try:
            # Generate response using LLM
            system_utt = respond_to_user_utt(user_utt, self.chat_history)

            # Update chat history
            self.chat_history.append({'Speaker': 'User',   'Utt': user_utt  })
            self.chat_history.append({'Speaker': 'System', 'Utt': system_utt})
            
            return system_utt
        
        except Exception as e:
            logger.error(f"Error in process_user_utterance: {e}")
            return "I'm sorry, I encountered an error while processing your request."


    # =======================================================================
    # Handle Incoming Data
    # =======================================================================
    async def receive(self, text_data):
        try:
            # Load the data
            data = json.loads(text_data)

            # -----------------------------------------------------------------------
            # Overlapped Speech
            # -----------------------------------------------------------------------
            if data['type'] == 'overlapped_speech':
                self.overlapped_speech_count += 1
                logger.info(f"{cf.YELLOW}Overlapped speech detected. Count: {self.overlapped_speech_count}")
            
            # -----------------------------------------------------------------------
            # Transcription
            # -----------------------------------------------------------------------
            elif data['type'] == 'transcription':
                # Format the utterance
                user_utt = data['data'].lower()
                logger.info(f"{cf.YELLOW}[ASR] Text data received: {user_utt}")
                
                # Generate LLM response
                LLM_start_time = time()
                response = self.process_user_utterance(user_utt)
                logger.info(f"{cf.CYAN}[LLM] Received LLM response in: {(time() - LLM_start_time):6.4f}s")
                
                # Send the LLMs response
                system_time = datetime.now(timezone.utc)
                await self.send(json.dumps({'type': 'llm_response', 'data': response, 'time': system_time.strftime("%H:%M:%S")}))
                logger.info(f"{cf.CYAN}[LLM] Response sent in:         {(time() - LLM_start_time):6.4f}s")
                
                # Generate & send biomarker scores
                biomarker_start_time = time()
                biomarker_scores = generate_biomarker_scores(
                    user_utt, self.conversation_start_time, response,
                    self.prosody_features, self.pronunciation_features,)

                # Log & send scores through the websocket
                logger.info(f"{cf.CYAN}[Bio] Biomarkers Time:        {(time()-biomarker_start_time):5.4f}s")
                await self.send(json.dumps({'type': 'biomarker_scores', 'data': biomarker_scores})) 

                # Add the most recent utterance to the history
                self.user_utterances.append(user_utt)
                print("\n")
            
            # -----------------------------------------------------------------------
            # Audio Data
            # -----------------------------------------------------------------------
            elif data['type'] == 'audio_data':
                logger.info(f"{cf.YELLOW}AUDIO DATA RECEIVED")
                await self.process_audio_data(data['data'], data['sampleRate'])
                
        except json.JSONDecodeError as e: logger.error(f"JSON decode error: {e}")


    # -----------------------------------------------------------------------
    # Process Audio Data
    # -----------------------------------------------------------------------
    async def process_audio_data(self, base64_data, sample_rate):
        try:
            # Decode base64 to bytes
            audio_bytes = base64.b64decode(base64_data)            
            logger.info(f"Received audio data: {len(audio_bytes)} bytes at {sample_rate}Hz")

            # Normalize audio data
            audio_array = np.frombuffer(audio_bytes, dtype=np.int16)
            audio_array = audio_array / np.max(np.abs(audio_array))

            # Resample to 16,000 Hz if necessary
            if sample_rate != SAMPLE_RATE:  # SAMPLE_RATE is 16000
                audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=SAMPLE_RATE)
                logger.info(f"Resampled audio to {SAMPLE_RATE}Hz")

            # Convert to float32 & extract features
            audio_array = librosa.util.buf_to_float(audio_array, n_bytes=2, dtype=np.float32)
            features = feature_extractor.process_signal(audio_array, SAMPLE_RATE)
            logger.info(f"Extracted features: {features.shape}")

            self.prosody_features       = features[PROSODY_FEATURES]
            self.pronunciation_features = features[PRONUNCIATION_FEATURES]

            return self.prosody_features, self.pronunciation_features
            
        except Exception as e: logger.error(f"Error processing audio data: {e}")
            
    # -----------------------------------------------------------------------
    # For sending scores calculated periodically (not every single utterance)
    # -----------------------------------------------------------------------
    async def send_periodic_scores(self):
        while True:
            await asyncio.sleep(10) # was 5 -(shouldn't that be 10? if we are doing /10 in the function and -0.1)
            if self.conversation_start_time is not None:
                # Calculate the periodic scores (currently Anomia and Turntaking)
                start_time = time()
                periodic_scores = generate_periodic_scores(self.user_utterances, self.conversation_start_time, self.overlapped_speech_count)
                logger.info(f"{cf.CYAN}[Bio] Periodic Time:          {(time()-start_time):5.3f}s")

                # Re-calculate overlapped speech count
                self.overlapped_speech_count = max(0, self.overlapped_speech_count - 0.1)

                # Send the scores ("Use self.send instead")
                await self.send(json.dumps({'type': 'periodic_scores', 'data': periodic_scores}))