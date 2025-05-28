
from collections import deque
from time import time

"""
The goal is for consumers.py to just be the mediator between all of the websocket stuff
So it listens for all incoming messages (from just the frontend right now I think, but maybe later if the compute engine is on a different server)


1) Created

start time, init all the objects, etc

2) On user utterances
* some biomarkers use different arguments, so don't want to save everything right away
    - should comment/document that here for clarity
* afterwards, text data needs to be saved

3) On audio data


3) On disconnect
* (this is done in the frontend right now....) save the chat to the database
* delete this object or whatever
* be ready on next connection to create a new one of these
* ... or maybe its different? just one of these per consumer?

"""

class ChatHandler:
    """
    conversation start time
    user utterances
    overlapped speech count
    chat history
    pros pron features

    perhaps some kind of UUID thing
    
    """

    def __init__(self):
        self.conversation_start_time = time()

        self.overlapped_speech_count = 0
        
        self.user_utterances         = deque(maxlen=100)
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






