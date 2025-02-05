import { useState, useRef } from "react";
import { API_ENDPOINT } from "./config";

interface VoiceRecorderProps {
    onTranscribed: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscribed }) => {
    const [recording, setRecording] = useState<boolean>(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        console.log("1");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                audioChunksRef.current.push(event.data);
            };

            console.log("2");
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                const formData = new FormData();
                formData.append("file", audioBlob);

                const response = await fetch(`${API_ENDPOINT}/chat-ai`, {
                    method: "POST",
                    //headers: { "Content-Type": "application/json" },
                    body: formData,
                });

                const data = await response.json();
                console.log("data: ", data);

                onTranscribed(data.text);
                console.log("data.text: ", data.text);
            };
            console.log("3");

            mediaRecorder.start();
            setRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    return (
        <div>
            <button onClick={recording ? stopRecording : startRecording}>
                {recording ? "Stop Recording" : "Start Recording"}
            </button>
        </div>
    );
};

export default VoiceRecorder;