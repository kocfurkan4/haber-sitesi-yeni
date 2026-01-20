// api/translate/route.ts - Gemini API ile Çeviri
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Gemini API anahtarını ortam değişkeninden oku
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * POST /api/translate
 * Metni İngilizce'den Türkçe'ye veya tersine çevirir.
 * @param request - { text: string, targetLang: 'tr' | 'en' } beklenir
 */
export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Metin ve hedef dil belirtilmelidir.' }, { status: 400 });
    }

    const prompt = `Aşağıdaki metni ${targetLang === 'tr' ? 'Türkçeye' : 'İngilizceye'} çevir. Sadece çevrilmiş metni döndür, başka bir açıklama yapma. Metin: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const translatedText = response.text?.trim() || '';

    return NextResponse.json({ translatedText }, { status: 200 });

  } catch (error) {
    console.error('Çeviri API hatası:', error);
    return NextResponse.json({ error: 'Çeviri servisinde bir hata oluştu.' }, { status: 500 });
  }
}
