import { useEffect                  } from 'react';
import { Button                     } from "react-bootstrap";
import { BsStopCircle, BsPlayCircle } from "react-icons/bs";
import useSpeechEngine from '../hooks/useSpeechEngine';

export default function RecordButton({onRecordingChange, ...restProps}) {
    // SpeechEngine (ASR, TTS, etc.)
    const { recording, startRecording, stopRecording } = useSpeechEngine(restProps);

    // Lift the "recording" boolean flag up (this could be done with useSpeaking, systemSpeaking as well)
    useEffect(() => {onRecordingChange?.(recording);}, [recording, onRecordingChange]);

    return (
        <>
            <Button variant="outline-primary" onClick={recording ? stopRecording : startRecording}>
                {recording ? 
                    <BsStopCircle size={50} style={{color: "red"         }}/> : 
                    <BsPlayCircle size={50} style={{color: "lightskyblue"}}/>
                }
            </Button>
        </>
    );
}