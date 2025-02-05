import { useState } from "react";
import { API_ENDPOINT } from "./config";
import VoiceRecorder from "@/app/components/VoiceRecorder";

const ChatUI: React.FC = () => {
    const [response, setResponse] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleTranscribed = async (text: string) => {
        console.log("chatUI 1");
        try {
            const res = await fetch(`${API_ENDPOINT}/chat-ai`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            console.log("chatUI 2");

            if (!res.ok) throw new Error("Failed to fetch AI response");

            const data = await res.json();
            setResponse(data.response_text);
            setAudioUrl(data.audio_url);
            console.log("chatUI 3");
            console.log("data = ", data);
            console.log("data.audio_url = ", data.audio_url);
        } catch (error) {
            console.error("Error processing chat:", error);
        }
    };

    return (
        <div>
            <h2>AI Voice Chat</h2>
            <VoiceRecorder onTranscribed={handleTranscribed} />
            {response && <p>Bot: {response}</p>}
            {audioUrl && (
                <audio controls autoPlay>
                    <source src={audioUrl} type="audio/mp3" />
                </audio>
            )}
        </div>
    );
};

export default ChatUI;