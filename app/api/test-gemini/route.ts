import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API anahtarı gereklidir' },
        { status: 400 }
      );
    }

    // Test: List available models
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
          error: 'API key geçersiz veya modeller listelenemedi',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return list of available models
    const models = data.models?.map((m: any) => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description,
    })) || [];

    return NextResponse.json({
      success: true,
      availableModels: models,
      totalCount: models.length
    });
  } catch (error: any) {
    console.error('API test error:', error);
    return NextResponse.json(
      { error: error.message || 'Test başarısız' },
      { status: 500 }
    );
  }
}
