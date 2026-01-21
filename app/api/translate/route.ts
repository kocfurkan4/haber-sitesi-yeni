// api/translate/route.ts - Gemini API ile Çeviri (SDK + Caching + Multiple Keys)
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

/**
 * POST /api/translate
 * Metni İngilizce'den Türkçe'ye veya tersine çevirir.
 * - Vercel KV ile caching (aynı metin için tekrar API çağrısı yapılmaz)
 * - Multiple API key desteği (virgülle ayrılmış, failover)
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

    // Cache key oluştur (text + targetLang)
    const cacheInput = `${text}:${targetLang}`;
    const contentHash = crypto.createHash('md5').update(cacheInput).digest('hex');
    const cacheKey = `translate:${contentHash}`;

    // Cache'e bak
    const cachedTranslation = await kv.get<string>(cacheKey);
    if (cachedTranslation) {
      console.log('✅ Cache hit! Çeviri cache\'den döndürülüyor:', {
        cacheKey,
        translationLength: cachedTranslation.length
      });
      return NextResponse.json({
        translatedText: cachedTranslation,
        model: 'gemini-flash-latest',
        method: 'Cache',
        targetLang,
        cached: true
      });
    }

    console.log('🌐 Çeviri API Çağrısı (Google SDK):', {
      targetLang,
      textLength: text.length,
      cacheKey
    });

    // Multiple API key desteği (virgülle ayrılmış)
    const apiKeys = apiKey.split(',').map((k: string) => k.trim()).filter(Boolean);
    let translatedText = '';
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
            temperature: 0.3, // Daha deterministik çeviri
            maxOutputTokens: 1000,
          }
        });

        const prompt = `Aşağıdaki metni ${targetLang === 'tr' ? 'Türkçeye' : 'İngilizceye'} çevir. Sadece çevrilmiş metni döndür, başka bir açıklama yapma. Metin: "${text}"`;

        // Çeviriyi oluştur
        const result = await model.generateContent(prompt);
        const response = result.response;
        translatedText = response.text();
        successfulKey = currentKey;

        console.log(`✅ API Key ${i + 1} başarılı!`, {
          translationLength: translatedText.length
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

    // Cache'e kaydet (30 gün)
    await kv.set(cacheKey, translatedText, { ex: 30 * 24 * 60 * 60 });
    console.log('💾 Çeviri cache\'e kaydedildi:', { cacheKey });

    return NextResponse.json({
      translatedText,
      model: 'gemini-flash-latest',
      method: 'Google SDK',
      targetLang,
      cached: false
    });

  } catch (error: any) {
    console.error('❌ Çeviri API hatası:', error);

    // SDK hata mesajlarını daha anlaşılır yap
    let errorMessage = error.message || 'Çeviri servisinde bir hata oluştu';

    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
      errorMessage = 'Geçersiz API anahtarı. Lütfen Admin panelinden yeni bir Gemini API anahtarı ekleyin.';
    } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      errorMessage = 'API quota aşıldı. Lütfen birkaç dakika bekleyin veya farklı bir API key ekleyin.';
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
