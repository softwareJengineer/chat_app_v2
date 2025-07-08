import { useRef, useEffect, useState } from "react";
import { TTSClass } from "@/speechProviders";

// --------------------------------------------------------------------
// Text-To-Speech (TTS) Hook
// --------------------------------------------------------------------
// ToDo: Do we need a start and stop here? Also the actual TTSClasses probably need a look...
export default function useTTS({
    onStart = () => {},
    onDone  = () => {},
} : {
    onStart : () => void,
    onDone  : () => void,
}) {
    // System speaking flag for overlap checks (can choose State and/or Ref)
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const  systemSpeakingRef                  = useRef  (false);

    // Instantiate TTS
    const ttsRef = useRef<TTSClass | null>(null);
    useEffect(() => {
        ttsRef.current = new TTSClass({
            onStart : () => { setSystemSpeaking(true ); systemSpeakingRef.current = true;  onStart(); },
            onDone  : () => { setSystemSpeaking(false); systemSpeakingRef.current = false; onDone (); },
        });
        return () => ttsRef.current?.stop();
    }, []);

    // Text-to-speech helper
    const speak = (text: string) => { ttsRef.current?.speak(text); };

    // Exposes "speak()" which can be called to perform TTS
    return { speak, systemSpeaking, systemSpeakingRef }; 
}
