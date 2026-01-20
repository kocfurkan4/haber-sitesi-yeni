// api/news/route.ts - Next.js App Router API Route
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// RSS Parser'ı başlat
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:group'], // Medya içeriğini yakalamak için
  },
});

/**
 * POST /api/news
 * İstemciden gelen RSS URL'lerini ayrıştırır ve haberleri döndürür.
 * @param request - İstemciden gelen istek (body'de { urls: string[] } beklenir)
 */
export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Geçerli RSS URL listesi sağlanmadı.' }, { status: 400 });
    }

    // Tüm RSS çekme işlemlerini paralel olarak başlat
    const fetchPromises = urls.map(async (url: string) => {
      try {
        const feed = await parser.parseURL(url);

        // Her bir haber öğesini standart bir formata dönüştür
        const newsItems = feed.items.map(item => {
          // Kaynak ismini temizle - tekrarları ve gereksiz kısımları kaldır
          let sourceName = feed.title || new URL(url).hostname;
          // Eğer kaynak ismi tekrar ediyorsa (örn: "Breaking DefenseBreaking Defense"), temizle
          const words = sourceName.split(' ');
          const uniqueWords = [...new Set(words)];
          if (words.length > uniqueWords.length * 1.5) {
            // Tekrar var, ilk yarısını al
            sourceName = words.slice(0, Math.ceil(words.length / 2)).join(' ');
          }
          // Tire ve sonrasını kaldır (örn: "Breaking Defense - News" -> "Breaking Defense")
          sourceName = sourceName.split('-')[0].trim();

          return {
            id: item.guid || item.link,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            content: item.contentSnippet || item.content,
            source: sourceName,
          };
        });

        return newsItems;
      } catch (error) {
        console.error(`RSS çekme hatası (${url}):`, error);
        // Hata durumunda boş bir dizi döndürerek uygulamanın çökmesini engelle
        return [];
      }
    });

    // Tüm sonuçları bekle ve tek bir dizide birleştir
    const results = await Promise.all(fetchPromises);
    const allNews = results.flat();

    // Haberleri tarihe göre sırala (en yeni en üstte)
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json(allNews, { status: 200 });

  } catch (error) {
    console.error('Genel API hatası:', error);
    // Genel bir sunucu hatası durumunda 500 döndür
    return NextResponse.json({ error: 'Sunucu tarafında beklenmedik bir hata oluştu.' }, { status: 500 });
  }
}
