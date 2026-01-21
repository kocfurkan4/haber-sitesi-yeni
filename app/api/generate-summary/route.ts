import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content, apiKey } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik gereklidir' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API anahtarı gereklidir' },
        { status: 400 }
      );
    }

    // Gemini API - Güncel ve stabil model
    // NOT: Model ismi URL'de zaten var, ekstra 'models/' EKLEME!
    const MODEL_NAME = 'gemini-1.5-flash-001'; // Tam versiyon numarası (özet için ideal)
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

    console.log('🔍 Özet API Çağrısı:', {
      url: GEMINI_API_URL,
      contentLength: content.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Lütfen aşağıdaki haberin kısa bir özetini çıkar. Sadece özet metnini yaz, başlık veya etiket ekleme. Maksimum 2-3 cümle:\n\n${content}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
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
      console.error('❌ Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        {
          error: errorData.error?.message || `Gemini API hatası (${response.status})`,
          details: errorData,
          model: MODEL_NAME,
          url: GEMINI_API_URL
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Gemini API Başarılı:', {
      model: MODEL_NAME,
      candidatesCount: data.candidates?.length
    });

    let summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up the summary
    summary = summary
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .replace(/^\*\*.*?\*\*:?\s*/gm, '') // Remove bold labels
      .replace(/^Özet:?\s*/gi, '') // Remove "Özet:" prefix
      .replace(/^Summary:?\s*/gi, '') // Remove "Summary:" prefix
      .trim();

    return NextResponse.json({ summary, model: MODEL_NAME });
  } catch (error: any) {
    console.error('❌ Summary generation error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Özet oluşturulurken bir hata oluştu',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
