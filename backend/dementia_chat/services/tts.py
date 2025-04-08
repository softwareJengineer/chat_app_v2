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
import io
import wave
import os
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
    chunk_size = 2048

    def producer():
        try:
            # Create a unique filename for the audio file
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"tts_output_{timestamp}.wav"

            # Open a file to save the audio
            with open(filename, "wb") as audio_file:
                for audio_chunk in tts_client.stream_tts_sync(utterance):
                    audio_data = audio_chunk[1] if isinstance(audio_chunk, tuple) else audio_chunk

                    # Encode as WAV
                    wav_buffer = io.BytesIO()
                    with wave.open(wav_buffer, 'wb') as wf:
                        wf.setnchannels(1)  # Mono
                        wf.setsampwidth(2)   # 2 bytes (16 bits)
                        wf.setframerate(24000)  # Sample rate
                        wf.writeframes(audio_data)

                    wav_data = wav_buffer.getvalue()

                    # Write the WAV data to the file
                    audio_file.write(wav_data)

                    # Add chunks to the queue for streaming
                    for i in range(0, len(wav_data), chunk_size):
                        sub_chunk = wav_data[i:i+chunk_size]
                        asyncio.run_coroutine_threadsafe(queue.put(sub_chunk), loop)

            logger.info(f"TTS audio saved to {filename}")

        except Exception as e:
            logger.error(f"TTS producer error: {e}")
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    executor.submit(producer)

    while True:
        sub_chunk = await queue.get()
        if sub_chunk is None:
            break
        yield sub_chunk

async def synthesize_utt_stream(utterance, consumer):
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
                base64_audio = base64.b64encode(audio_chunk).decode('utf-8')
                message = {"type": "tts_audio", "data": base64_audio}
                await consumer.send(text_data=json.dumps(message))
                await asyncio.sleep(0)  # Yield control
        except Exception as e:
            logger.error(f"TTS streaming failed: {e}")

        await asyncio.sleep(0.1)
        cf.overlap_check = 0