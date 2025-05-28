import { useEffect                  } from 'react';
import { Button                     } from "react-bootstrap";
import { BsStopCircle, BsPlayCircle, BsPauseCircle } from "react-icons/bs";
import useSpeechEngine from '../hooks/useSpeechEngine';

export default function RecordButton({onRecordingChange, ...restProps}) {
    // SpeechEngine (ASR, TTS, etc.)
    const { recording, startRecording, stopRecording } = useSpeechEngine(restProps);

    // Lift the "recording" boolean flag up (this could be done with useSpeaking, systemSpeaking as well)
    useEffect(() => {onRecordingChange?.(recording);}, [recording, onRecordingChange]);

    return (
        <>
            <button 
                    className="flex flex-col gap-2 items-center"
                    onClick={recording ? stopRecording : startRecording}
                >
                    {recording ? 
                        <BsPauseCircle size={50} style={{color: "black"}}/> : 
                        <BsPlayCircle size={50} style={{color: "black"}}/>}
                    {recording ? "Pause Chat" : "Start Chat"}
            </button>
        </>
    );
}