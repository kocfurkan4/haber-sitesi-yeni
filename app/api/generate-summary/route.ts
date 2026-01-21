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

    // Gemini API'ye istek at (server-side, güvenli)
    // Model: gemini-1.5-flash-latest (en güncel stable versiyon)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);

      return NextResponse.json(
        {
          error: errorData.error?.message || 'Gemini API hatası',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    let summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up the summary
    summary = summary
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .replace(/^\*\*.*?\*\*:?\s*/gm, '') // Remove bold labels
      .replace(/^Özet:?\s*/gi, '') // Remove "Özet:" prefix
      .replace(/^Summary:?\s*/gi, '') // Remove "Summary:" prefix
      .trim();

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Özet oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
