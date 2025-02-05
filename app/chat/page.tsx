import type { NextApiRequest, NextApiResponse } from "next";

interface ChatRequestBody {
  text: string;
}

interface ChatResponse {
  response_text: string;
  audio_url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text }: ChatRequestBody = req.body;

    const response = await fetch(process.env.NEXT_PUBLIC_API_GATEWAY_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from API Gateway");
    }

    const data: ChatResponse = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error calling API Gateway:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}