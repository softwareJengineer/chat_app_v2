/*  ====================================================================
 *  TestASR
 *  ====================================================================
 *  Does nothing except call the given callbacks so the frontend logic can be tested.
 *
 *  constructor(opts) expects:
 *      onUtterance(text)          : callback fired with fake text
 *      onUserSpeakingChange(flag) : (optional) callback true/false
 *      onUserSpeakingStart()      : (optional) callback fired to check for overlapped speech (should be passed the checkOverlap function)
 *
 *  start_stream()  : begins a "recording" timer
 *  stop_stream()   : cancels the timer
 * ==================================================================== */
export class TestASR {
    constructor({ onUtterance, onUserSpeakingChange, onUserSpeakingStart }) {
        this.onUtterance          = onUtterance;
        this.onUserSpeakingChange = onUserSpeakingChange ?? (() => {});
        this.onUserSpeakingStart  = onUserSpeakingStart  ?? (() => {});
        this._timer               = null;
    }

    // --------------------------------------------------------------------
    // Every 3 seconds: user speaking -> utterance -> user stopped speaking
    // --------------------------------------------------------------------
    start_stream() {if (this._timer) return;
        let speaking = false;

        // Repeat every 3 seconds
        this._timer = setInterval(() => {
            if (!speaking) {
                // Set speaking to true -> 1.2 seconds later the "utterance" is received
                speaking = true; this.onUserSpeakingChange(true); this.onUserSpeakingStart();
                setTimeout(() => {this.onUtterance('[test] Hello world'); speaking = false; this.onUserSpeakingChange(false);}, 1_200);
            }
        }, 3_000);
    }

    // Stop streaming
    stop_stream() {clearInterval(this._timer); this._timer = null; this.onUserSpeakingChange(false);}
}

/*  ====================================================================
 *  TestTTS
 *  ====================================================================
 *  Prints to console and waits 1s to mimic latency.
 *
 *  constructor(opts)
 *      onStart() / onDone()  : (optional) hooks
 *
 *  speak(text : string) : void
 *  stop()               : void  (clears pending timeout)
 * ==================================================================== */
export class TestTTS {
    constructor({ onStart, onDone }) {
        this.onStart = onStart ?? (() => {});
        this.onDone  = onDone  ?? (() => {});
        this._timeout = null;
    }

    // Speech function -> does nothing but print to console
    speak(text) {if (!text) return;
        this.onStart();
        console.log(`[TestTTS] would speak: "${text}"`);
        this._timeout = setTimeout(() => {console.log('[TestTTS] done'); this.onDone();}, 1_000); // simulate 1-second playback
    }

    stop() {clearTimeout(this._timeout); this.onDone();}
}
