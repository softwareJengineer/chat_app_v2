const AudioRecordingWorklet = `
        class AudioProcessingWorklet extends AudioWorkletProcessor {
            buffer = new Int16Array(2048);
            bufferWriteIndex = 0;

            constructor() {
                super();
            }

            process(inputs, outputs, parameters) {
                if (inputs.length > 0 && inputs[0].length > 0) {
                    const channelData = inputs[0][0];
                    this.processChunk(channelData);
                }
                return true; // Keep processor alive
            }

            sendAndClearBuffer() {
                if (this.bufferWriteIndex > 0) {
                    const dataToSend = this.buffer.slice(0, this.bufferWriteIndex);
                    this.port.postMessage({
                        eventType: "audioData",
                        audioData: dataToSend.buffer // Send ArrayBuffer
                    }, [dataToSend.buffer]); // Transfer buffer ownership for efficiency
                    this.bufferWriteIndex = 0;
                }
            }

            processChunk(float32Array) {
                for (let i = 0; i < float32Array.length; i++) {
                    const clampedValue = Math.max(-1.0, Math.min(1.0, float32Array[i]));
                    const int16Value = Math.floor(clampedValue * 32767);
                    this.buffer[this.bufferWriteIndex++] = int16Value;
                    if (this.bufferWriteIndex >= this.buffer.length) {
                        this.sendAndClearBuffer();
                    }
                }
            }
        }
        registerProcessor('audio-processing-worklet', AudioProcessingWorklet);
    `;

const VolumeMeterWorklet = `
    class VolumeMeter extends AudioWorkletProcessor {
        constructor() {
            super();
            this.volume = 0;
        }
        
        process(inputs) {
            const input = inputs[0];
            if (input.length > 0 && input[0].length > 0) {
                // Calculate RMS (Root Mean Square)
                let sumOfSquares = 0.0;
                for (const sample of input[0]) {
                    sumOfSquares += sample * sample;
                }
                const rms = Math.sqrt(sumOfSquares / input[0].length);
                
                // Convert RMS to a linear scale (0.0 to 1.0)
                this.volume = Math.min(1.0, rms * 10); // Adjust multiplier as needed for sensitivity
                // Post a message to main thread with the volume level
                this.port.postMessage({ volume: this.volume });
            } else {
                this.volume = 0;
            }
            
            return true;
        }
    }
    registerProcessor('volume-meter', VolumeMeter);
    `;

export { AudioRecordingWorklet, VolumeMeterWorklet };