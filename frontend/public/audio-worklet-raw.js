// ====================================================================
// audio-worklet-raw.js
// ====================================================================
// Pushes raw Float32 PCM frames (128 samples by default) to the main thread.
class RawAudioProcessor extends AudioWorkletProcessor {
    process(inputs) {
        // inputs[0][0] is a Float32Array for channel-0 of the mic
        if (inputs[0] && inputs[0][0]) {this.port.postMessage(inputs[0][0]);} // transfer one frame
        return true;                                                          // keep running
    }
}
registerProcessor('raw-audio-processor', RawAudioProcessor);