// api/translate/route.ts - Gemini API ile Çeviri (REST API)
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/translate
 * Metni İngilizce'den Türkçe'ye veya tersine çevirir.
 * @param request - { text: string, targetLang: 'tr' | 'en', apiKey: string } beklenir
 */
export async function POST(req: NextRequest) {
  try {
    const { text, targetLang, apiKey } = await req.json();

    // Validasyon
    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Metin ve hedef dil belirtilmelidir.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API anahtarı belirtilmelidir. Lütfen Admin panelinden Gemini API anahtarınızı ekleyin.' },
        { status: 400 }
      );
    }

    // Gemini API - KESİNLİKLE ÇALIŞAN MODEL
    const MODEL_NAME = 'gemini-pro';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

    console.log('🌐 Çeviri API Çağrısı:', {
      url: GEMINI_API_URL,
      targetLang,
      textLength: text.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });

    const prompt = `Aşağıdaki metni ${targetLang === 'tr' ? 'Türkçeye' : 'İngilizceye'} çevir. Sadece çevrilmiş metni döndür, başka bir açıklama yapma. Metin: "${text}"`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3, // Daha deterministik çeviri
        maxOutputTokens: 1000,
      },
    };

    const response = await fetch(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini Translation Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      // Daha detaylı hata mesajları
      if (response.status === 400) {
        return NextResponse.json(
          { error: 'Geçersiz API anahtarı veya istek formatı.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: errorData.error?.message || `Gemini API hatası (${response.status})`,
          details: errorData,
          model: MODEL_NAME
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Gemini Translation Başarılı:', {
      model: MODEL_NAME,
      candidatesCount: data.candidates?.length
    });

    let translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up
    translatedText = translatedText
      .replace(/^["']|["']$/g, '') // Remove quotes
      .trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: 'Çeviri metni boş döndü. API anahtarınızı kontrol edin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText,
      model: MODEL_NAME,
      targetLang
    });

  } catch (error: any) {
    console.error('❌ Çeviri API hatası:', error);

    return NextResponse.json(
      {
        error: 'Çeviri servisinde bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
