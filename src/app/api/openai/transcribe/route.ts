import { NextResponse } from "next/server";
import fs from "fs";
import OpenAI from "openai";

// Check if OpenAI API key exists
const openaiApiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

try {
  if (openaiApiKey) {
    openai = new OpenAI({
      apiKey: openaiApiKey
    });
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

export async function POST(req: Request) {
  // If OpenAI client is not initialized, return an appropriate response
  if (!openai) {
    return NextResponse.json(
      { 
        error: "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.", 
        text: "" 
      },
      { status: 503 }
    );
  }

  const body = await req.json();
  const base64Audio = body.audio;

  // Convert the base64 audio data to a Buffer
  const audio = Buffer.from(base64Audio, "base64");

  // Define the file path for storing the temporary WAV file
  const filePath = "tmp/input.wav";

  try {
    // Write the audio data to a temporary WAV file synchronously
    fs.writeFileSync(filePath, audio);

    // Create a readable stream from the temporary WAV file
    const readStream = fs.createReadStream(filePath);

    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    // Remove the temporary file after successful processing
    fs.unlinkSync(filePath);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.error();
  }
}
