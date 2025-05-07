# =======================================================================
# Consumers.py
# =======================================================================
# Processes incoming messages, scores them, and responds

import numpy  as np
import pandas as pd

import json, asyncio, uuid, logging

from channels.generic.websocket import AsyncWebsocketConsumer
from collections import deque
from time        import time
from datetime    import datetime, timezone
from django.apps import apps
from channels.db import database_sync_to_async

# Helper functions
from ..                            import config as cf
from .biomarkers.biomarker_scores  import generate_biomarker_scores, generate_periodic_scores
from .services.process_utterance   import process_user_utterance 
from .services.handle_audio_data   import handle_audio_data

# Configure logging
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------
# Multi-threading for biomarker and audio processing
# --------------------------------------------------------------------
import concurrent.futures
THREAD_POOL = concurrent.futures.ThreadPoolExecutor(max_workers=4)

"""
To do later:
* clean up process utterance file
* saving data history
* stuff like maintaining a speech df
"""
class ChatConsumer(AsyncWebsocketConsumer):
    # =======================================================================
    # Connect & Disconnect
    # =======================================================================
    async def connect(self):
        self.client_id = id(self)
        try:
            # Verify LLM is initialized
            if not cf.llm: raise RuntimeError("LLM not initialized")

            # --------------------------------------------------------------------
            # Properties
            # --------------------------------------------------------------------
            self.conversation_start_time = time()
            self.user_utterances         = deque(maxlen=100)
            self.overlapped_speech_count = 5   # --- should start at 0, but im testing it
            self.chat_history            = []

            # Features for Prosody and Pronunciation 
            self.prosody_features       = None
            self.pronunciation_features = None

            # For convenience
            self.bio_args = {
                "conversation_start_time"   : self.conversation_start_time,
                "prosody_features"          : self.prosody_features, 
                "pronunciation_features"    : self.pronunciation_features
            }

            # --------------------------------------------------------------------
            # Connection Handling
            # --------------------------------------------------------------------
            self.Chat = apps.get_model('dementia_chat', 'Chat')
            self.chatID = str(uuid.uuid4())

            # Accept the connection & start the periodic scores asynchronous task
            await self.accept()
            self.periodic_scores_task  = asyncio.create_task(self.send_periodic_scores())

        except Exception as e:
            logger.error(f"Failed to initialize consumer: {e}"); return

    # --------------------------------------------------------------------
    # Disconnect
    # --------------------------------------------------------------------
    async def disconnect(self, close_code):
        # Cleanly stop the periodic scores task
        if hasattr(self, 'periodic_scores_task'):
            self.periodic_scores_task.cancel()
            try: await self.periodic_scores_task
            except asyncio.CancelledError: logger.info("Periodic scores task successfully cancelled.")

        # Reset some properties for the next connection
        self.conversation_start_time = 0.0
        self.overlapped_speech_count = 0.0
        self.user_utterances.clear()
        
        logger.info(f"Client disconnected: {self.client_id} {close_code}")

    # =======================================================================  
    # Save the chat
    # =======================================================================
    @database_sync_to_async
    def store_chat(self, user, date, time, scores, avgScores, notes, messages):
        """Store utterance in database asynchronously"""
        try: self.Chat.objects.create(chatID=self.chatID, user=user, date=date, time=time, scores=scores, avgScores=avgScores, notes=notes, messages=messages)
        except Exception as e: logger.error(f"Failed to store chat: {e}")

    # =======================================================================
    # Periodic Biomarkers
    # =======================================================================
    async def send_periodic_scores(self):
        while True:
            await asyncio.sleep(10) # was 5 -(shouldn't that be 10? if we are doing /10 in the function and -0.1)
            if self.conversation_start_time is not None:
                # Calculate the periodic scores (currently Anomia and Turntaking)
                start_time = time()
                periodic_scores = generate_periodic_scores(self.user_utterances, self.conversation_start_time, self.overlapped_speech_count)
                logger.info(f"{cf.CYAN}[Bio] Periodic Time:          {(time()-start_time):6.4f}s")

                # Re-calculate overlapped speech count
                self.overlapped_speech_count = max(0, self.overlapped_speech_count - 0.1)

                # Send the scores ("Use self.send instead")
                await self.send(json.dumps({'type': 'periodic_scores', 'data': periodic_scores}))

    # =======================================================================
    # Handle Incoming Data
    # =======================================================================
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if   data['type'] == 'overlapped_speech' : await self._handle_overlapped_speech(    )
            elif data['type'] == 'transcription'     : await self._handle_transcription    (data)
            elif data['type'] == 'audio_data'        : await self._handle_audio_data       (data)
                
        except json.JSONDecodeError as e: logger.error(f"JSON decode error: {e}")

    # -----------------------------------------------------------------------
    # Overlapped Speech
    # -----------------------------------------------------------------------
    async def _handle_overlapped_speech(self):
        self.overlapped_speech_count += 1
        logger.info(f"{cf.YELLOW}Overlapped speech detected. Count: {self.overlapped_speech_count}")

    # -----------------------------------------------------------------------
    # Audio Data
    # -----------------------------------------------------------------------
    async def _handle_audio_data(self, data):
        loop = asyncio.get_running_loop()
        start_time = time()

        # Run heavy function in thread pool
        prosody_features, pronunciation_features = await loop.run_in_executor(THREAD_POOL, handle_audio_data, data)
        logger.info(f"{cf.CYAN}[Aud] Audio data processed:    {(time()-start_time):5.4f}s")
    
        # Save the features
        self.bio_args[      "prosody_features"] =       prosody_features
        self.bio_args["pronunciation_features"] = pronunciation_features

    # -----------------------------------------------------------------------
    # Text Transcription
    # -----------------------------------------------------------------------
    async def _handle_transcription(self, data):
        # Format the utterance
        user_utt = data['data'].lower()
        logger.info(f"{cf.YELLOW}[ASR] Text data received:  {user_utt}")
        
        # 1) Generate & send LLM response (not threaded...)
        system_utt = await self._LLM_response(user_utt)
        
        # 2) Generate & send biomarker scores (run in a thread so we don't block the loop)
        asyncio.create_task(self._on_utterance_biomarkers(user_utt, system_utt))

        # Add the most recent utterance to the history
        self.user_utterances.append(user_utt); print()


    # Generate LLM Response
    async def _LLM_response(self, user_utt: str):
        LLM_start_time = time()
        system_utt = process_user_utterance(user_utt, self.chat_history)
        logger.info(f"{cf.CYAN}[LLM] Received LLM response in: {(time() - LLM_start_time):6.4f}s")
        
        # Send the LLMs response through the websocket
        await self.send(json.dumps({'type': 'llm_response', 'data': system_utt, 'time': datetime.now(timezone.utc).strftime("%H:%M:%S")}))
        logger.info(f"{cf.CYAN}[LLM] Response sent in:         {(time() - LLM_start_time):6.4f}s")

        # Update chat history & return the system utterance
        #self.chat_history.append({'Speaker': 'User',   'Utt': user_utt  })
        #self.chat_history.append({'Speaker': 'System', 'Utt': system_utt})
        return system_utt


    # Biomarkers (on utterance)
    async def _on_utterance_biomarkers(self, user_utt, sys_utt):
        loop = asyncio.get_running_loop()
        start_time = time()

        # Run heavy function in thread pool
        #scores = await loop.run_in_executor(THREAD_POOL, generate_biomarker_scores, user_utt, sys_utt, **self.bio_args)
        scores = await loop.run_in_executor(THREAD_POOL, lambda: generate_biomarker_scores(user_utt, sys_utt, **self.bio_args))
        logger.info(f"{cf.CYAN}[Bio] Biomarkers done in:      {(time()-start_time):5.4f}s")

        # Save biomarkers and send them back through the websocket connection
        await self.send(json.dumps({'type': 'biomarker_scores', 'data': scores}))

