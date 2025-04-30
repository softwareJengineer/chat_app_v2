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
 *
 *  start_stream()  : begin continuous recognition
 *  stop_stream()   : stop recognition
 * ==================================================================== */
export class AzureASR {
    constructor({ subscriptionKey, serviceRegion, onUtterance, onUserSpeakingChange, onUserSpeakingStart }) {
        if (!window.SpeechSDK) {throw new Error('SpeechSDK global not found - make sure the Azure SDK script tag is loaded.');}

        this.onUtterance          = onUtterance;
        this.onUserSpeakingChange = onUserSpeakingChange ?? (() => {});
        this.onUserSpeakingStart  = onUserSpeakingStart  ?? (() => {});

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
        this.recognizer.recognizing = (_s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {this.onUserSpeakingChange(true);}
        };

        this.recognizer.recognized = (_s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                this.onUserSpeakingChange(false);
                if (e.result.text) {this.onUtterance(e.result.text);}
            }
        };
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
    constructor({ subscriptionKey, serviceRegion, onStart, onDone }) {
      if (!window.SpeechSDK) {throw new Error("SpeechSDK global not found - load Azure Speech script first");}
  
      this.onStart = onStart ?? (() => {});
      this.onDone  = onDone  ?? (() => {});
  
      // Azure setup 
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
      this.synthesizer   = new SpeechSDK.SpeechSynthesizer(speechConfig);
    }
  
    // --------------------------------------------------------------------
    // Synthesize audio for the given text
    // --------------------------------------------------------------------
    speak(text) {if (!text) return;
      this.onStart();
      this.synthesizer.speakTextAsync(
        text,
        (result) => {if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {console.log("Speech synthesized"); this.onDone()}},
        (error ) => {console.error("AzureTTS error:", error); this.onDone();}
      );
    }
  
    // Cancels any ongoing synthesis & audio playback
    stop() {this.synthesizer.stopSpeakingAsync(); this.onDone();}
  }
  