// src/hooks/useLatencyLogger.js
import { useRef, useEffect } from 'react';
import {formatFloat} from "../utils/loggingHelpers"

// ==================================================================== ==================================
// Helper for tracking performance and latency (times all in seconds)
// ==================================================================== ==================================
// * Could add functionality for keeping ALL of these times saved in arrays and have a way to export them to a csv
export default function useLatencyLogger() {
    // --------------------------------------------------------------------
    // Utility Functions
    // --------------------------------------------------------------------
    const getWallMono  = (       ) => {return [Date.now()/1_000, performance.now()/1_000];            };
    const toWallClock  = (monoNow) => {return wallStartRef.current + (monoNow - monoStartRef.current);};
    const logWithColor = (string ) => {console.log(`%c${string}`, "color: #8FBC8F");                };

    // --------------------------------------------------------------------
    // Timer References
    // --------------------------------------------------------------------
    // ASR
    const asrStartRef = useRef(0.0);
    const asrEndRef   = useRef(0.0);
    
    // LLM (backend)
    const llmTimesRef = useRef([]);

    // TTS
    const ttsTimesRef = useRef([ ]);
    const ttsStartRef = useRef(0.0);

    // --------------------------------------------------------------------
    // Start Times (wall clock & mono)
    // --------------------------------------------------------------------
    const wallStartRef = useRef(0.0);
    const monoStartRef = useRef(0.0);

    // Set the wall & monotonic clock start times
    useEffect(() => {
        [wallStartRef.current, monoStartRef.current] = getWallMono();
        logWithColor(`Starting wall-clock time: ${formatFloat(wallStartRef.current,4,15)} | ${formatFloat(monoStartRef.current,4,8)}`);
    }, []);

    // ====================================================================
    // Timing Functions
    // ====================================================================
    // ----- Add better number formatting later -----
    // For single line logging (just showing the current timestamp for later analysis)
    const logTime = (prefix, ref) => {
        const [nowWall, nowMono] = getWallMono();
        logWithColor(`${prefix} ${formatFloat(nowMono,4,9)}, ${formatFloat(nowWall,4,15)} | ${formatFloat(toWallClock(nowMono),4,15)}`);
        ref.current = nowMono;
    };

    // For round trip timing (ASR end -> TTS start & TTS start -> TTS end) 
    const logStartEnd = (service, timesRef, startingRef) => {
        // Get the latency
        const [nowWall, nowMono] = getWallMono();
        const newLatency = nowMono - startingRef.current;
        timesRef.current.push(newLatency);

        // Get the average latency so far
        const count = timesRef.current.length;
        const avg   = timesRef.current.reduce((a, b) => a + b, 0) / count;
        
        // Log both the current time & the new latency
        logWithColor(`[${service}] Finished at:         ${formatFloat(nowMono,4,9)}, ${formatFloat(nowWall,4,15)} | ${formatFloat(toWallClock(nowMono),4,15)}`);
        console.log(`%c[${service}] ${formatFloat(newLatency,4,7)} ms (avg ${formatFloat(avg,4,8)} ms over ${count} runs)`, "color: #89CFF0");
    };

    // --------------------------------------------------------------------
    // Functions for each point in time we actually care about logging
    // --------------------------------------------------------------------
    // [ASR] Log the start & end time of user speech detection
    const asrStart = () => {logTime("[ASR] User speaking start:", asrStartRef);};
    const asrEnd   = () => {logTime("[ASR] User speaking end:  ", asrEndRef  );};

    // [LLM] Time from: ASR transcription received -> LLM response sent to TTS
    const llmEnd = () => {logStartEnd("LLM", llmTimesRef, asrEndRef);};

    // [TTS] Log the start & end time of speech synthesis (currently not correct... "synthesis" != audio playing) 
    const ttsStart = () => {logTime    ("[TTS] LLM response sent:  ", ttsStartRef);};
    const ttsEnd   = () => {logStartEnd("TTS", ttsTimesRef,           ttsStartRef);};

    // ====================================================================
    // Return/Expose Logging Functions
    // ====================================================================
    return {
        asrStart, asrEnd,
                  llmEnd,
        ttsStart, ttsEnd,
    };
}
