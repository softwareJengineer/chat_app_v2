import { Button } from "react-bootstrap";
import { BsStopCircle, BsPlayCircle } from "react-icons/bs";
import useSpeechEngine from '../hooks/useSpeechEngine';

export default function RecordButton(props) {
    const { recording, startRecording, stopRecording } = useSpeechEngine(props);

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