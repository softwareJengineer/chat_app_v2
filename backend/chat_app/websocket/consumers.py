# =======================================================================
# Processes incoming messages, scores them, and responds
# =======================================================================
from django.apps import apps

import json, asyncio, logging
logger = logging.getLogger(__name__)

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db                import database_sync_to_async

from time     import time
from datetime import datetime, timezone

# From this project
from ..                    import config as cf
from ..services            import ChatService
from .services.chatHelpers import generate_LLM_response
from .services.audioHelpers import extract_audio_biomarkers, extract_text_biomarkers

"""
To do here:

For turntaking/overlapped speech, we know how much time is passing because of the audio data, so we canuse that as a reference

maybe shouldnt use send_json ?

"""
# ------------------------------------------------------------------
# Helper: Start a background task and log any exception it raises --- put into another file
# ------------------------------------------------------------------
def fire_and_log(coro):
    async def _runner():
        try: await coro
        except Exception: logger.exception("Background task crashed")
    return asyncio.create_task(_runner())


# ======================================================================= ===================================
# ChatConsumer 
# ======================================================================= ===================================
class ChatConsumer(AsyncJsonWebsocketConsumer):
    MAX_CONTEXT = 15  # (how many recent messages to keep for the LLM)

    # =======================================================================
    # Initiate the WebSocket connection
    # =======================================================================
    async def connect(self):
        # -----------------------------------------------------------------------
        # 1) Authentication Block (authenticate before accepting the connection, uses custom "unauth" code)
        # -----------------------------------------------------------------------
        if not self.scope["user"].is_authenticated: await self.close(code=4001); return
        self.user = self.scope["user"]
        await self.accept()

        # -----------------------------------------------------------------------
        # 2) Load or create an active session
        # -----------------------------------------------------------------------
        self.session = await database_sync_to_async(ChatService.get_or_create_active_session)(self.user)
        recent = await database_sync_to_async(lambda: list(self.session.messages.all().order_by("-start_ts")[: self.MAX_CONTEXT])[::-1])()

        # ToDo: I added the timestamps in just now for biomarker scores, but I actually don't really like how this works at the moment...
        self.context_buffer = [(m.role, m.content, m.ts.timestamp()) for m in recent]

        # Other misc. setup
        self.overlapped_speech_count  = 0.0
        self.audio_windows_count      = 0.0
        self.overlapped_speech_events = []  # List of timestamps (ToDo: Add this to the DB somehow)

        # There's almost no reason to send these back live right?
        self.return_biomarkers       = False   # ToDo: change this based on the chat "source" field (?) only send back if source is webapp

        # -----------------------------------------------------------------------
        # 3) Send misc information to the frontend (ToDo: biomarkers, etc)
        # -----------------------------------------------------------------------
        # This is where we could potentially have a connection on the robot and web app and monitor the conversation in real time
        if self.return_biomarkers: await self.send_json({"type": "history", "messages": self.context_buffer})

    # -----------------------------------------------------------------------
    # Close connection 
    # -----------------------------------------------------------------------
    async def disconnect(self, code):
        # Reset some properties for the next connection
        self.context_buffer.clear()
        logger.info(f"Client disconnected: {self.user} {code}") 


    # ======================================================================= ===================================
    # Handle Incoming Data
    # ======================================================================= ===================================
    async def receive_json(self, data, **kwargs):
        # Overlapped Speech
        if data["type"] == "overlapped_speech": 
            self.overlapped_speech_count += 1
            self.overlapped_speech_events.append(time())
            logger.info(f"{cf.YELLOW}Overlapped speech detected. Count: {self.overlapped_speech_count} {cf.RESET}")
    
        # Audio data or text transcription
        elif data["type"] == "audio_data"   : await self._handle_audio_data   (data)
        elif data["type"] == "transcription": await self._handle_transcription(data)


    # =======================================================================
    # Text Transcriptions
    # =======================================================================
    # On-Utterance Biomarkers
    async def _on_utterance_biomarkers(self):
        utterance_biomarkers = await extract_text_biomarkers(self.context_buffer)

        # Save biomarkers to the DB
        fire_and_log(database_sync_to_async(ChatService.add_biomarker)(self.user, "pragmatic", utterance_biomarkers["pragmatic"]))
        fire_and_log(database_sync_to_async(ChatService.add_biomarker)(self.user, "grammar",   utterance_biomarkers["grammar"  ]))
        fire_and_log(database_sync_to_async(ChatService.add_biomarker)(self.user, "anomia",    utterance_biomarkers["anomia"   ]))
        if self.return_biomarkers: await self.send(json.dumps({"type": "biomarker_scores", "data": utterance_biomarkers}))
    
    # Process and respond to the users utterance text
    async def _handle_transcription(self, data):
        text = data["data"].lower()
        user = self.user

        # -----------------------------------------------------------------------
        # 1) Process the users message & reply with the LLM ASAP
        # -----------------------------------------------------------------------
        # Fire-and-forget DB write for the user message
        fire_and_log(database_sync_to_async(ChatService.add_message)(user, "user", text))

        # Update in-memory context
        self.context_buffer.append(("user", text, time()))
        if len(self.context_buffer) > self.MAX_CONTEXT: self.context_buffer.pop(0)

        # Get the LLMs response (awaited since it is the most important/longest process)
        system_utt = await generate_LLM_response(self.context_buffer)

        # Immediately send the response back through the websocket
        await self.send(json.dumps({'type': 'llm_response', 'data': system_utt, 'time': datetime.now(timezone.utc).strftime("%H:%M:%S")}))

        # -----------------------------------------------------------------------
        # 2) Background persistence & biomarkers
        # -----------------------------------------------------------------------
        # LLM/Assistant message
        fire_and_log(database_sync_to_async(ChatService.add_message)(user, "assistant", system_utt))

        # Update the in-memory buffer again
        self.context_buffer.append(("assistant", system_utt, time()))
        if len(self.context_buffer) > self.MAX_CONTEXT: self.context_buffer.pop(0)

        # On-utterance biomarker scores (run in a thread so we don't block the loop)
        fire_and_log(self._on_utterance_biomarkers(text, system_utt))

    # =======================================================================
    # Audio Data
    # =======================================================================
    async def _handle_audio_data(self, data):
        # Generate the audio-related biomarker scores
        audio_biomarkers = await extract_audio_biomarkers(data, self.overlapped_speech_count)
      
        # Save biomarkers to the DB
        fire_and_log(database_sync_to_async(ChatService.add_biomarker)(self.user, "prosody",       audio_biomarkers["prosody"      ]))
        fire_and_log(database_sync_to_async(ChatService.add_biomarker)(self.user, "pronunciation", audio_biomarkers["pronunciation"]))
        fire_and_log(database_sync_to_async(ChatService.add_biomarker)(self.user, "turntaking",    audio_biomarkers["turntaking"   ]))
        if self.return_biomarkers: await self.send(json.dumps({"type": "audio_scores", "data": audio_biomarkers}))

        # Update turntaking (12 audio windows for 1 minute of data)
        self.audio_windows_count += 1
        self.overlapped_speech_count = self.overlapped_speech_count / (self.audio_windows_count / 12)
     

    # =======================================================================  
    # Save the chat
    # =======================================================================
    @database_sync_to_async
    def store_chat(self, user, date, time, scores, avgScores, notes, messages):
        """Store utterance in database asynchronously"""
        try: self.Chat.objects.create(chatID=self.chatID, user=user, date=date, time=time, scores=scores, avgScores=avgScores, notes=notes, messages=messages)
        except Exception as e: logger.error(f"Failed to store chat: {e}")

