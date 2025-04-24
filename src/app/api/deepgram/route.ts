import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    if (!process.env.DEEPGRAM_API_KEY) {
        return NextResponse.json({
            error: "Deepgram API key is not configured. Please set the DEEPGRAM_API_KEY environment variable.",
            key: ""
        }, { status: 503 });
    }
    
    return NextResponse.json({
        key: process.env.DEEPGRAM_API_KEY,
    });
}
