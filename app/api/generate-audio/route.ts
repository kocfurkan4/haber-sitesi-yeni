import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, apiKey } = await request.json();

    if (!text || !apiKey) {
      return NextResponse.json(
        { error: "Metin ve API anahtarı gerekli" },
        { status: 400 }
      );
    }

    // ElevenLabs API Text-to-Speech endpoint
    // Using a default Turkish voice ID (Rachel - supports multilingual)
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      return NextResponse.json(
        { error: "Ses oluşturulamadı: " + response.statusText },
        { status: response.status }
      );
    }

    // Get the audio as buffer
    const audioBuffer = await response.arrayBuffer();

    // Convert to base64 for client-side playback
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
    });
  } catch (error: any) {
    console.error("Error generating audio:", error);
    return NextResponse.json(
      { error: "Ses oluşturma hatası: " + error.message },
      { status: 500 }
    );
  }
}
