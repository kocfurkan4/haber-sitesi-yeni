import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/generate-summary
 * Google Gemini SDK ile haber özeti oluşturur
 * URL sorunları SDK tarafından otomatik çözülür
 */
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

    console.log('🔍 Özet API Çağrısı (Google SDK):', {
      contentLength: content.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });

    // Google Generative AI SDK kullan (URL derdi yok!)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    const prompt = `Lütfen aşağıdaki haberin kısa bir özetini çıkar. Sadece özet metnini yaz, başlık veya etiket ekleme. Maksimum 2-3 cümle:\n\n${content}`;

    // Özet oluştur
    const result = await model.generateContent(prompt);
    const response = result.response;
    let summary = response.text();

    console.log('✅ Gemini SDK Başarılı:', {
      model: 'gemini-flash-latest',
      summaryLength: summary.length
    });

    // Clean up the summary
    summary = summary
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .replace(/^\*\*.*?\*\*:?\s*/gm, '') // Remove bold labels
      .replace(/^Özet:?\s*/gi, '') // Remove "Özet:" prefix
      .replace(/^Summary:?\s*/gi, '') // Remove "Summary:" prefix
      .trim();

    return NextResponse.json({
      summary,
      model: 'gemini-flash-latest',
      method: 'Google SDK'
    });

  } catch (error: any) {
    console.error('❌ Summary generation error:', error);

    // SDK hata mesajlarını daha anlaşılır yap
    let errorMessage = error.message || 'Özet oluşturulurken bir hata oluştu';

    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
      errorMessage = 'Geçersiz API anahtarı. Lütfen Admin panelinden yeni bir Gemini API anahtarı ekleyin.';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
