import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const NEWS_KEY = 'collected_news';

export async function GET() {
  try {
    // Vercel KV'den haberleri çek
    const news = await kv.get<any[]>(NEWS_KEY);

    return NextResponse.json({
      success: true,
      news: news || [],
      count: (news || []).length
    });
  } catch (error: any) {
    console.error('Failed to get news from KV:', error);
    return NextResponse.json(
      { error: error.message || 'Haberler alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { news: newArticles } = await req.json();

    if (!Array.isArray(newArticles)) {
      return NextResponse.json(
        { error: 'Haberler bir dizi olmalıdır' },
        { status: 400 }
      );
    }

    // Mevcut haberleri al
    const existingNews = await kv.get<any[]>(NEWS_KEY) || [];

    let addedCount = 0;
    let updatedCount = 0;

    // Upsert mantığı: Eğer sourceUrl varsa güncelle, yoksa ekle
    const newsMap = new Map(
      existingNews.map(article => [article.sourceUrl, article])
    );

    newArticles.forEach(article => {
      if (newsMap.has(article.sourceUrl)) {
        // Mevcut haberi güncelle (id ve isSent koru)
        const existing = newsMap.get(article.sourceUrl);
        newsMap.set(article.sourceUrl, {
          ...existing,
          ...article,
          id: existing.id,
          isSent: existing.isSent,
        });
        updatedCount++;
      } else {
        // Yeni haber ekle
        newsMap.set(article.sourceUrl, article);
        addedCount++;
      }
    });

    // Map'i array'e çevir
    const updatedNews = Array.from(newsMap.values());

    // Vercel KV'ye kaydet
    await kv.set(NEWS_KEY, updatedNews);

    return NextResponse.json({
      success: true,
      added: addedCount,
      updated: updatedCount,
      total: updatedNews.length
    });
  } catch (error: any) {
    console.error('Failed to save news to KV:', error);
    return NextResponse.json(
      { error: error.message || 'Haberler kaydedilemedi' },
      { status: 500 }
    );
  }
}

// DELETE endpoint - belirli haberleri veya hepsini sil
export async function DELETE(req: NextRequest) {
  try {
    const { sourceUrls } = await req.json();

    if (sourceUrls === 'all') {
      // Tüm haberleri sil
      await kv.del(NEWS_KEY);
      return NextResponse.json({
        success: true,
        message: 'Tüm haberler silindi'
      });
    }

    if (!Array.isArray(sourceUrls)) {
      return NextResponse.json(
        { error: 'sourceUrls bir dizi olmalıdır' },
        { status: 400 }
      );
    }

    // Mevcut haberleri al
    const existingNews = await kv.get<any[]>(NEWS_KEY) || [];

    // Belirtilen URL'leri filtrele
    const filteredNews = existingNews.filter(
      article => !sourceUrls.includes(article.sourceUrl)
    );

    // Güncellenmiş listeyi kaydet
    await kv.set(NEWS_KEY, filteredNews);

    return NextResponse.json({
      success: true,
      deleted: existingNews.length - filteredNews.length,
      remaining: filteredNews.length
    });
  } catch (error: any) {
    console.error('Failed to delete news from KV:', error);
    return NextResponse.json(
      { error: error.message || 'Haberler silinemedi' },
      { status: 500 }
    );
  }
}
