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
    # Define a chunk size in bytes for smaller sub-chunks.
    chunk_size = 1024  # adjust this size as needed

    def producer():
        try:
            for audio_chunk in tts_client.stream_tts_sync(utterance):
                # Extract the audio data if audio_chunk is a tuple
                audio_data = audio_chunk[1] if isinstance(audio_chunk, tuple) else audio_chunk
                # If the returned audio data is large, send it in smaller pieces.
                for i in range(0, len(audio_data), chunk_size):
                    sub_chunk = audio_data[i:i+chunk_size]
                    # Schedule putting the sub-chunk into the async queue.
                    asyncio.run_coroutine_threadsafe(queue.put(sub_chunk), loop)
                # (Optional) If you need to slow down slightly between chunks, add a tiny sleep.
                # time.sleep(0.01)
        except Exception as e:
            logger.error(f"TTS producer error: {e}")
        finally:
            # Signal end-of-stream by putting a None marker in the queue.
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    # Run the producer in a separate thread so it doesn't block the event loop.
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    executor.submit(producer)

    while True:
        sub_chunk = await queue.get()
        if sub_chunk is None:  # End-of-stream marker received
            break
        yield sub_chunk

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