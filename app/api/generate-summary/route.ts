import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

/**
 * POST /api/generate-summary
 * Google Gemini SDK ile haber özeti oluşturur
 * - Vercel KV ile caching (aynı içerik için tekrar API çağrısı yapılmaz)
 * - Multiple API key desteği (virgülle ayrılmış, failover)
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

    // Content hash oluştur (cache key için)
    const contentHash = crypto.createHash('md5').update(content).digest('hex');
    const cacheKey = `summary:${contentHash}`;

    // Cache'e bak
    const cachedSummary = await kv.get<string>(cacheKey);
    if (cachedSummary) {
      console.log('✅ Cache hit! Özet cache\'den döndürülüyor:', {
        cacheKey,
        summaryLength: cachedSummary.length
      });
      return NextResponse.json({
        summary: cachedSummary,
        model: 'gemini-flash-latest',
        method: 'Cache',
        cached: true
      });
    }

    console.log('🔍 Özet API Çağrısı (Google SDK):', {
      contentLength: content.length,
      cacheKey
    });

    // Multiple API key desteği (virgülle ayrılmış)
    const apiKeys = apiKey.split(',').map((k: string) => k.trim()).filter(Boolean);
    let summary = '';
    let successfulKey = '';
    let lastError: any = null;

    // Her API key'i dene (biri başarısız olursa diğeri)
    for (let i = 0; i < apiKeys.length; i++) {
      const currentKey = apiKeys[i];
      try {
        console.log(`🔑 API Key ${i + 1}/${apiKeys.length} deneniyor...`, {
          keyPrefix: currentKey.substring(0, 10) + '...'
        });

        const genAI = new GoogleGenerativeAI(currentKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-flash-latest',
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        });

        const prompt = `Aşağıdaki haberi KISA ve ÖZ bir şekilde özetle. Özetinde EN FAZLA 3-4 cümle kullan. Sadece özet metnini yaz, "Özet:", "Başlık:" gibi etiketler veya formatlama ekleme. Doğrudan özet cümleleriyle başla:\n\n${content}`;

        // Özet oluştur
        const result = await model.generateContent(prompt);
        const response = result.response;
        summary = response.text();
        successfulKey = currentKey;

        console.log(`✅ API Key ${i + 1} başarılı!`, {
          summaryLength: summary.length
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

    console.log('✅ Gemini SDK Başarılı (Ham Yanıt):', {
      model: 'gemini-flash-latest',
      rawSummary: summary,
      summaryLength: summary.length,
      usedKeyPrefix: successfulKey.substring(0, 10) + '...'
    });

    // Clean up the summary - sadece başlangıçtaki etiketleri temizle
    summary = summary
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .replace(/^\*\*Özet:?\*\*:?\s*/gi, '') // Remove "**Özet:**" prefix
      .replace(/^\*\*Summary:?\*\*:?\s*/gi, '') // Remove "**Summary:**" prefix
      .replace(/^Özet:?\s*/gi, '') // Remove "Özet:" prefix
      .replace(/^Summary:?\s*/gi, '') // Remove "Summary:" prefix
      .replace(/^\*\*/gm, '') // Remove starting **
      .replace(/\*\*$/gm, '') // Remove ending **
      .trim();

    // Cache'e kaydet (30 gün)
    await kv.set(cacheKey, summary, { ex: 30 * 24 * 60 * 60 });
    console.log('💾 Özet cache\'e kaydedildi:', { cacheKey });

    return NextResponse.json({
      summary,
      model: 'gemini-flash-latest',
      method: 'Google SDK',
      cached: false
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
