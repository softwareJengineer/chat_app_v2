import { Button } from "react-bootstrap";
import { BsStopCircle, BsPlayCircle } from "react-icons/bs";
import useSpeechEngine from '../hooks/useSpeechEngine';

export default function RecordButton(props) {
    const { recording, start, stop } = useSpeechEngine(props);

    return (
        <>
            <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? <BsStopCircle/> : <BsPlayCircle/>}
            </Button>
        </>
    );
}