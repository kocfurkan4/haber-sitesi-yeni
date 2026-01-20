// api/translate/route.ts - Gemini API ile Çeviri (localStorage API Key)
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * POST /api/translate
 * Metni İngilizce'den Türkçe'ye veya tersine çevirir.
 * @param request - { text: string, targetLang: 'tr' | 'en', apiKey: string } beklenir
 */
export async function POST(request: Request) {
  try {
    const { text, targetLang, apiKey } = await request.json();

    // Validasyon
    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Metin ve hedef dil belirtilmelidir.' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API anahtarı belirtilmelidir. Lütfen Ayarlar sayfasından Gemini API anahtarınızı ekleyin.' }, { status: 400 });
    }

    // Request'ten gelen API anahtarı ile dinamik olarak Gemini client oluştur
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `Aşağıdaki metni ${targetLang === 'tr' ? 'Türkçeye' : 'İngilizceye'} çevir. Sadece çevrilmiş metni döndür, başka bir açıklama yapma. Metin: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const translatedText = response.text?.trim() || '';

    if (!translatedText) {
      return NextResponse.json({ error: 'Çeviri metni boş döndü. API anahtarınızı kontrol edin.' }, { status: 500 });
    }

    return NextResponse.json({ translatedText }, { status: 200 });

  } catch (error: any) {
    console.error('Çeviri API hatası:', error);

    // Daha detaylı hata mesajları
    if (error.message?.includes('API key')) {
      return NextResponse.json({ error: 'Geçersiz API anahtarı. Lütfen Ayarlar sayfasından geçerli bir Gemini API anahtarı girin.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Çeviri servisinde bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') }, { status: 500 });
  }
}
