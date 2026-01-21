import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/test-models?apiKey=xxx
 * API key'in hangi modelleri desteklediğini test eder
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key gerekli: ?apiKey=YOUR_KEY' },
        { status: 400 }
      );
    }

    console.log('🔍 API Key test ediliyor...');

    // Google Generative AI models listesi
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'API key geçersiz veya erişim hatası',
          details: errorData,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Sadece generateContent destekleyen modelleri filtrele
    const supportedModels = data.models
      ?.filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName,
        description: model.description
      })) || [];

    console.log('✅ Desteklenen modeller:', supportedModels.length);

    return NextResponse.json({
      success: true,
      totalModels: supportedModels.length,
      models: supportedModels
    });

  } catch (error: any) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Model listesi alınamadı'
      },
      { status: 500 }
    );
  }
}
