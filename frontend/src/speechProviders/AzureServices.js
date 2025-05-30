// Configuration from .env variables
const subscriptionKey = import.meta.env.VITE_SPEECH_KEY     || ''      ;
const serviceRegion   = import.meta.env.VITE_SERVICE_REGION || 'eastus';

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';


/*  ====================================================================
 *  AzureASR
 *  ====================================================================
 *  Wrapper around Azure Speech SDK.
 *
 *  constructor(opts) expects:
 *      subscriptionKey   : Azure key
 *      serviceRegion     : Azure region string ("eastus")
 *      onUtterance(text) : callback fired with the full utterance text
 *      onUserSpeakingChange(flag) : (optional) callback fired true/false
 *      onUserSpeakingStart()      : (optional) callback fired to check for overlapped speech (should be passed the checkOverlap function)
 *
 *  start_stream()  : begin continuous recognition
 *  stop_stream()   : stop recognition
 * ==================================================================== */
export class AzureASR {
    constructor({ onUserSpeaking, onUserSpeakingStart, onUserSpeakingEnd }) {
        this.onUserSpeaking      = onUserSpeaking      ?? (() => {});
        this.onUserSpeakingStart = onUserSpeakingStart ?? (() => {});
        this.onUserSpeakingEnd   = onUserSpeakingEnd   ?? (() => {});

        // --------------------------------------------------------------------
        // Azure Setup
        // --------------------------------------------------------------------
        this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        this.speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);

        // --------------------------------------------------------------------
        // Events
        // --------------------------------------------------------------------
        let firstResult = true;

        // Mark the beginning of the utterance (first speech recognized)...
        // & check for overlapped speech each chunk (not sure about keeping this, might slow things slightly)
        this.recognizer.recognizing = () => {
            if (firstResult) {this.onUserSpeakingStart(); firstResult = false;} 
            this.onUserSpeaking();
        }

        this.recognizer.recognized = (_s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                if (e.result.text) {this.onUserSpeakingEnd(e.result.text);}
                firstResult = true;
            };
        }
    }

    // --------------------------------------------------------------------
    // Start & Stop
    // --------------------------------------------------------------------
    start_stream() {this.recognizer.startContinuousRecognitionAsync();}
    stop_stream () {this.recognizer.stopContinuousRecognitionAsync ();}
}


/*  ====================================================================
 *  AzureTTS
 *  ====================================================================
 *  Wrapper around Azure Speech SDK TTS.
 *
 *  constructor(opts)
 *      subscriptionKey : Azure key
 *      serviceRegion   : Azure region ("eastus")
 *      onStart()       : called right before audio playback begins      (optional)
 *      onDone()        : called after playback finishes OR on error     (optional)
 *
 *  speak(text : string) : void
 *  stop()               : void   (cancels any ongoing synthesis/playback)
 * ==================================================================== */
export class AzureTTS {
    constructor({ onStart, onDone }) {
        this.onStart = onStart ?? (() => {});
        this.onDone  = onDone  ?? (() => {});
    
        // Azure Setup 
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        const audioConfig  = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
        this.synthesizer   = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

        // Timing the start and end of audio synthesis
        let firstChunk = true;
        this.synthesizer.synthesizing       = () => {if (firstChunk) {this.onStart(); firstChunk = false;}}
        this.synthesizer.synthesisCompleted = () => {                 this.onDone (); firstChunk = true;  }
    }
  
    // --------------------------------------------------------------------
    // Synthesize audio for the given text
    // --------------------------------------------------------------------
    speak(text) {this.synthesizer.speakTextAsync(text);} 
    stop (    ) {this.onDone();                        }
}