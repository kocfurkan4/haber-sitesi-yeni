import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

/**
 * DELETE /api/delete-news
 * Deletes a news article from Vercel KV storage
 * Body: { newsId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { newsId } = await req.json();

    if (!newsId) {
      return NextResponse.json(
        { error: 'newsId gereklidir' },
        { status: 400 }
      );
    }

    // Get all news from KV
    const allNews = await kv.get<any[]>('processed_news') || [];

    // Filter out the news item to delete
    const updatedNews = allNews.filter((news: any) => news.id !== newsId);

    // Save updated list back to KV
    await kv.set('processed_news', updatedNews);

    console.log(`✅ Haber silindi: ${newsId}`);

    return NextResponse.json({
      success: true,
      message: 'Haber başarıyla silindi',
      deletedId: newsId
    });

  } catch (error: any) {
    console.error('❌ Haber silme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Haber silinemedi' },
      { status: 500 }
    );
  }
}
