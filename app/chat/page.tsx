"use client";

import { useState } from "react";
import { Button, TextField, View, Flex, Card } from "@aws-amplify/ui-react";
import { MdSend } from "react-icons/md";  // ✅ Use Material Icons for the send button
import { API_ENDPOINT } from "@/app/components/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiEndpoint = `${API_ENDPOINT}/chat-deepseek`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatContent: input }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.chatResponse || "No response from AI" }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Error fetching response" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Chat Title at the Top */}
      <h1 className="text-2xl font-bold text-center mb-4">Chat with AI</h1>

      {/* Chat Message Container (Expands to Take Up Available Space) */}
      <View className="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-100 space-y-4">
        {messages.map((msg, index) => (
          <Card
            key={index}
            variation="elevated"
            className={`p-3 max-w-xs ${msg.role === "user"
              ? "ml-auto bg-blue-500 text-white font-bold text-right"
              : "mr-auto bg-gray-200 text-left"
              }`}
          >
            {msg.content}
          </Card>
        ))}
      </View>

      {/* Input Box & Submit Button (on the same row at the bottom) */}
      <View className="absolute bottom-0 left-0 w-full bg-white border-t pt-4 p-4 flex flex-row items-center gap-2 shadow-lg">
        <TextField
          label=""
          labelHidden
          className="flex-1 rounded-lg border-4 border-gray-900 px-6 py-4 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-blue-500 transition ease-in-out duration-150 shadow-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />

        <Button
          variation="primary"
          onClick={sendMessage}
          isDisabled={loading}
          //className="w-12 h-12 flex justify-center items-center"
          className="hidden"
        >
          {loading ? "..." : <MdSend size={20} />}
        </Button>
      </View>
    </View>
  );
}