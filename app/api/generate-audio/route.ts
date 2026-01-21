import { NextRequest, NextResponse } from "next/server";
import { kv } from '@vercel/kv';
import crypto from 'crypto';

/**
 * POST /api/generate-audio
 * ElevenLabs API ile text-to-speech
 * - Vercel KV ile caching (aynı metin için tekrar API çağrısı yapılmaz)
 * - Multiple API key desteği (virgülle ayrılmış, failover)
 */
export async function POST(request: NextRequest) {
  try {
    const { text, apiKey } = await request.json();

    if (!text || !apiKey) {
      return NextResponse.json(
        { error: "Metin ve API anahtarı gerekli" },
        { status: 400 }
      );
    }

    // Cache key oluştur (text için)
    const contentHash = crypto.createHash('md5').update(text).digest('hex');
    const cacheKey = `audio:${contentHash}`;

    // Cache'e bak (audio base64)
    const cachedAudio = await kv.get<string>(cacheKey);
    if (cachedAudio) {
      console.log('✅ Cache hit! Ses cache\'den döndürülüyor:', {
        cacheKey,
        audioLength: cachedAudio.length
      });
      return NextResponse.json({
        success: true,
        audioUrl: cachedAudio,
        cached: true
      });
    }

    console.log('🎙️ Ses Oluşturma API Çağrısı:', {
      textLength: text.length,
      cacheKey
    });

    // ElevenLabs API - Default Turkish voice (Rachel - multilingual)
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

    // Multiple API key desteği (virgülle ayrılmış)
    const apiKeys = apiKey.split(',').map((k: string) => k.trim()).filter(Boolean);
    let audioDataUrl = '';
    let successfulKey = '';
    let lastError: any = null;

    // Her API key'i dene (biri başarısız olursa diğeri)
    for (let i = 0; i < apiKeys.length; i++) {
      const currentKey = apiKeys[i];
      try {
        console.log(`🔑 API Key ${i + 1}/${apiKeys.length} deneniyor...`, {
          keyPrefix: currentKey.substring(0, 10) + '...'
        });

        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
          {
            method: "POST",
            headers: {
              "Accept": "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": currentKey,
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
          throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
        }

        // Get the audio as buffer
        const audioBuffer = await response.arrayBuffer();

        // Convert to base64 for client-side playback
        const base64Audio = Buffer.from(audioBuffer).toString("base64");
        audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;
        successfulKey = currentKey;

        console.log(`✅ API Key ${i + 1} başarılı!`, {
          audioSize: audioBuffer.byteLength
        });
        break; // Başarılı olduysa döngüden çık

      } catch (error: any) {
        lastError = error;
        console.error(`❌ API Key ${i + 1} başarısız:`, error.message);

        // Son key de başarısız olduysa hata fırlat
        if (i === apiKeys.length - 1) {
          throw error;
        }
        // Değilse bir sonraki key'i dene
        continue;
      }
    }

    // Cache'e kaydet (30 gün) - UYARI: Büyük audio dosyaları için dikkatli ol
    // Vercel KV max value size: 1MB, base64 audio genelde birkaç yüz KB
    if (audioDataUrl.length < 500000) { // 500KB'den küçükse cache'le
      await kv.set(cacheKey, audioDataUrl, { ex: 30 * 24 * 60 * 60 });
      console.log('💾 Ses cache\'e kaydedildi:', {
        cacheKey,
        size: `${(audioDataUrl.length / 1024).toFixed(2)} KB`
      });
    } else {
      console.log('⚠️ Ses çok büyük, cache\'lenmiyor:', {
        size: `${(audioDataUrl.length / 1024).toFixed(2)} KB`
      });
    }

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      cached: false
    });

  } catch (error: any) {
    console.error("❌ Ses oluşturma hatası:", error);

    // Hata mesajlarını daha anlaşılır yap
    let errorMessage = error.message || 'Ses oluşturma hatası';

    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorMessage = 'Geçersiz ElevenLabs API anahtarı. Lütfen Admin panelinden kontrol edin.';
    } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      errorMessage = 'ElevenLabs quota aşıldı. Lütfen birkaç dakika bekleyin veya farklı bir API key ekleyin.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
