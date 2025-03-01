import base64
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from time import time
import logging
import random
import re
from collections import deque
import pandas as pd
import asyncio
import numpy as np
import librosa
import math
from datetime import datetime, timezone
from .. import config as cf
from .biomarker_models.altered_grammer import generate_grammar_score
from .biomarker_models.coherence_function import coherence
import os

current_path = os.path.dirname(os.path.abspath(__file__))

vectors_path = current_path + '/biomarker_models/new_LSA.csv'
entropy_path = current_path + '/biomarker_models/Hoffman_entropy_53758.csv'
stop_path = current_path + '/biomarker_models/stoplist.txt'

# Configure logging
logger = logging.getLogger(__name__)
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.client_id = id(self)
        try:
            # Verify LLM is initialized
            if not cf.llm:
                raise RuntimeError("LLM not initialized")
            # Rest of connect code...
            self.conversation_start_time = time()
            self.user_utterances = deque(maxlen=100)
            self.overlapped_speech_count = 0
            self.global_llm_response = ""
            self.vectors = pd.read_csv(vectors_path, index_col=0)
            self.entropy = pd.read_csv(entropy_path)
            self.stop_list = pd.read_table(stop_path, header=None)
            self.history_speech_df = pd.DataFrame(columns=['V1', 'V2'])
            self.chat_history = []  # Add chat_history as instance variable
            await self.accept()
            self.periodic_scores_task = asyncio.create_task(self.send_periodic_scores())
        except Exception as e:
            logger.error(f"Failed to initialize consumer: {e}")
            return

    async def disconnect(self, close_code):
        if hasattr(self, 'periodic_scores_task'):
            self.periodic_scores_task.cancel()
        self.conversation_start_time = None
        self.user_utterances.clear()
        self.overlapped_speech_count = 0
        logger.info(f"Client disconnected: {self.client_id}")

    def process_user_utterance(self, user_utt):
        try:
            # Prepare input for LLM
            history = self.chat_history[-5:] if len(self.chat_history) > 5 else self.chat_history
            
            input_text = f"<|system|>\n{cf.prompt}<|end|>"
            for turn in history:
                if turn['Speaker'] == 'User':
                    input_text += f"\n<|user|>\n{turn['Utt']}<|end|>"
                else:
                    input_text += f"\n<|assistant|>\n{turn['Utt']}<|end|>"
            input_text += f"\n<|user|>\n{user_utt}<|end|>\n<|assistant|>\n"
            
            # Generate response using LLM
            output = cf.llm(input_text, max_tokens=cf.max_length, stop=["<|end|>",".", "?"], echo=True)
            system_utt = (output['choices'][0]['text'].split("<|assistant|>")[-1]).strip()
            
            # Update chat history
            self.chat_history.append({'Speaker': 'User', 'Utt': user_utt})
            self.chat_history.append({'Speaker': 'System', 'Utt': system_utt})
            
            return system_utt
        except Exception as e:
            logger.error(f"Error in process_user_utterance: {e}")
            return "I'm sorry, I encountered an error while processing your request."

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            if data['type'] == 'overlapped_speech':
                self.overlapped_speech_count += 1
                logger.info(f"Overlapped speech detected. Count: {self.overlapped_speech_count}")
            
            elif data['type'] == 'transcription':
                user_utt = data['data'].lower()
                logger.info(f"Received user utterance: {user_utt}")
                
                # Generate LLM response
                response = self.process_user_utterance(user_utt)
                logger.info("Received response!")
                system_time = datetime.now(timezone.utc)
                await self.send(json.dumps({
                    'type': 'llm_response',
                    'data': response,
                    'time': system_time.strftime("%H:%M:%S")
                }))
                self.global_llm_response = response
                
                # Generate biomarker scores
                biomarker_scores = self.generate_biomarker_scores(user_utt)
                await self.send(json.dumps({
                    'type': 'biomarker_scores',
                    'data': biomarker_scores
                })) 
                
                self.global_llm_response = response
            
            elif data['type'] == 'audio_data':
                print("AUDIO DATA RECEIVED")
                await self.process_audio_data(data['data'], data['sampleRate'])
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")

    async def process_audio_data(self, base64_data, sample_rate):
        try:
            # Decode base64 to bytes
            audio_bytes = base64.b64decode(base64_data)
            
            logger.info(f"Received audio data: {len(audio_bytes)} bytes at {sample_rate}Hz")
        
            audio_array = np.frombuffer(audio_bytes, dtype=np.int16)
            
            # Normalize audio data
            audio_array = audio_array / np.max(np.abs(audio_array))
            
            # Convert to float32
            audio_array = librosa.util.buf_to_float(audio_array, n_bytes=2, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"Error processing audio data: {e}")

    def generate_pragmatic_score(self, user_utt):
        # Calculate pragmatic score
        try:
        
            # Split the sentence into words
            utter_list = [i.split() for i in list(user_utt)]

            # Create the user column with 'user' repeated for each word
            user_column = ['user'] * sum(len(utt) for utt in utter_list)

            # Flatten the list of words
            words = [word for utt in utter_list for word in utt]

            response_list = [i.split() for i in [self.global_llm_response]]

            # Create the user column with 'user' repeated for each word
            robot_column = ['robot'] * sum(len(resp) for resp in response_list)

            # Flatten the list of words
            resp_words = [word for resp in response_list for word in resp]

            # Prepare the speech data
            new_speech_dict = {'V1': user_column+robot_column,  # 'user' repeated for each word in the sentence
                        'V2': words+resp_words}  # Words from the utterance
            print("new_speech_dict",new_speech_dict)    
            logger.info(f"new_speech_dict conversation : {new_speech_dict}")
            
            new_speech_df = pd.DataFrame(new_speech_dict)
            logger.info(f"created new history speech dataframe : {new_speech_df}")
        except Exception as e:
            logger.error(f"Error preparing speech data for coherence calculation: {e}")
            return 1
        
        try:
            pragmatic_score = coherence(new_speech_df, vectors=self.vectors, entropy=self.entropy, stop_list=self.stop_list)
            # Assuming adjusted_pragmatic_score is a float
            if math.isnan(pragmatic_score):
                print("is nan condition pragmatic_score",pragmatic_score)
                pragmatic_score = 0

            if pragmatic_score != 0:
                adjusted_pragmatic_score = 1 - pragmatic_score
            else:
                adjusted_pragmatic_score = 0
            
            print("pragmatic_score",pragmatic_score)
            print("adjusted_pragmatic_score",adjusted_pragmatic_score)
            logger.info(f"generated new pragmatic score: {adjusted_pragmatic_score}")
            return adjusted_pragmatic_score
        except Exception as e:
            logger.error(f"Error calculating pragmatic score: {e}")
            return 1
            

    def generate_altered_grammar_score(self, user_utt, current_duration):
        try:
            altered_grammar_score = generate_grammar_score(list(user_utt), current_duration)
        except Exception as e:
            logger.error(f"Error calculating altered grammar score: {e}")
            return 1
        print("altered_grammar_score",altered_grammar_score)
        return altered_grammar_score

    def generate_turntaking_score(self):
        normalized_score = min(self.overlapped_speech_count / 10, 1)
        self.overlapped_speech_count = max(0, self.overlapped_speech_count - 0.1)
        return normalized_score

    def generate_anomia_score(self):
        pattern = r'\b(u+h+|a+h+|u+m+|h+m+|h+u+h+|m+h+|h+m+|h+a+h+)\b'
        all_fillers = []
        for sentence in self.user_utterances:
            filler_words = re.findall(pattern, sentence, re.IGNORECASE)
            all_fillers.extend(filler_words)
        
        duration_minutes = (time() - self.conversation_start_time) / 60
        fillers_per_minute = len(all_fillers) / duration_minutes if duration_minutes > 0 else 0
        return min(fillers_per_minute / 10, 1)

    def generate_prosody_score(self, user_utt):
        return random.random()

    def generate_pronunciation_score(self, user_utt):
        return random.random()

    def generate_biomarker_scores(self, user_utt):
        self.user_utterances.append(user_utt)
        if self.conversation_start_time is not None:
                current_duration = time() - self.conversation_start_time
        return {
            'pragmatic': 1.0 - self.generate_pragmatic_score(user_utt),
            'grammar': 1.0 - self.generate_altered_grammar_score(user_utt, current_duration),
            'prosody': 1.0 - self.generate_prosody_score(user_utt),
            'pronunciation': 1.0 - self.generate_pronunciation_score(user_utt)
        }
    
    async def send_periodic_scores(self):  # Remove websocket parameter
        while True:
            await asyncio.sleep(5)
            if self.conversation_start_time is not None:
                anomia_score = 1.0 - self.generate_anomia_score()
                turntaking_score = 1.0 - self.generate_turntaking_score()
                await self.send(json.dumps({  # Use self.send instead
                    'type': 'periodic_scores',
                    'data': {
                        'anomia': anomia_score,
                        'turntaking': turntaking_score
                    }
                }))