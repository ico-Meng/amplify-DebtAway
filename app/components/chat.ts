import { NextRequest, NextResponse } from "next/server";

interface ChatRequestBody {
    text: string;
}

interface ChatResponse {
    response_text: string;
    audio_url: string;
}

export async function POST(req: NextRequest) {
    try {
        const { text }: ChatRequestBody = await req.json();

        const response = await fetch(process.env.NEXT_PUBLIC_API_GATEWAY_URL || "", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch from API Gateway");
        }

        const data: ChatResponse = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error calling API Gateway:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}