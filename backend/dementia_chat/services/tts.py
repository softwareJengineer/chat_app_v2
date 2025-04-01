# -*- coding:utf-8 -*-
'''
Synthesize utterances using fastrtc TTS SDK mainly from 'parse_tree.py' file and 'asr.py' file.
'''
import time
import datetime
import re
import json
import base64
import asyncio
import concurrent.futures
from fastrtc import get_tts_model  # Import fastrtc TTS
from . import asr
from .. import config as cf

# set logger
logger = cf.logging.getLogger("__tts__")

# Initialize fastrtc TTS model (model "kokoro" is currently supported)
tts_client = get_tts_model(model="kokoro")

# Helper: Wrap synchronous TTS generator into an async generator using a queue.
async def stream_tts_async(utterance):
    loop = asyncio.get_event_loop()
    queue = asyncio.Queue()

    def producer():
        try:
            for audio_chunk in tts_client.stream_tts_sync(utterance):
                # Schedule putting an item into the queue from this thread.
                asyncio.run_coroutine_threadsafe(queue.put(audio_chunk), loop)
        except Exception as e:
            logger.error(f"TTS producer error: {e}")
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)  # Signal completion

    # Run the producer in a thread so it doesn't block the event loop.
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    executor.submit(producer)

    while True:
        audio_chunk = await queue.get()
        if audio_chunk is None:  # End-of-stream marker
            break
        yield audio_chunk

async def synthesize_utt_stream(utterance, consumer):
    """
    Asynchronously stream TTS audio chunks (base64-encoded) to the frontend
    via the provided WebSocket consumer.
    """
    if cf.overlap_check == 0 and utterance:
        cf.overlap_check = 1
        utt_start_time = round(time.time() - cf.game_start_time, 5)
        logger.info(f"New utterance is: {utterance}")
        print()
        print('**********' * 5)
        print('System: ', utterance)
        print('**********' * 5)
        print()
        
        start_time = str(datetime.timedelta(seconds=utt_start_time)).split(".")[0]
        one_turn_history = {'Speaker': 'System', 'Utt': utterance, 'Time': start_time}
        cf.chat_history.append(one_turn_history)
        asr.record_chat()

        try:
            async for audio_chunk in stream_tts_async(utterance):
                # If audio_chunk is a tuple, extract the audio data.
                audio_data = audio_chunk[1] if isinstance(audio_chunk, tuple) else audio_chunk
                base64_audio = base64.b64encode(audio_data).decode('utf-8')
                message = {"type": "tts_audio", "data": base64_audio}
                await consumer.send(text_data=json.dumps(message))
                await asyncio.sleep(0)  # Yield control
        except Exception as e:
            logger.error(f"TTS streaming failed: {e}")

        await asyncio.sleep(0.1)
        cf.overlap_check = 0