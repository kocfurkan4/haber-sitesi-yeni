import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "RSS URLs gerekli" },
        { status: 400 }
      );
    }

    const allNews: any[] = [];

    // Her RSS kaynağını paralel olarak çek
    const promises = urls.map(async (url: string) => {
      try {
        const feed = await parser.parseURL(url);

        if (!feed || !feed.items || !Array.isArray(feed.items)) {
          console.error(`Boş feed: ${url}`);
          return [];
        }

        return feed.items
          .filter((item: any) => item && (item.title || item.link))
          .map((item: any) => {
            const content = item.contentSnippet || item.content || item.description || "";
            const cleanContent = content.replace(/<[^>]*>/g, "").trim();

            return {
              id: item.guid || item.link || `${Date.now()}-${Math.random()}`,
              title: (item.title || "Başlıksız").substring(0, 200),
              link: item.link || "#",
              pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
              content: cleanContent.substring(0, 500),
              source: feed.title || "Bilinmeyen Kaynak",
              score: 0, // Frontend'de hesaplanacak
              isSent: false,
            };
          });
      } catch (error) {
        console.error(`RSS hatası (${url}):`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);

    // Tüm sonuçları birleştir
    results.forEach((items) => {
      allNews.push(...items);
    });

    // Tarihe göre sırala (en yeni önce)
    allNews.sort((a, b) => {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    return NextResponse.json(allNews);
  } catch (error: any) {
    console.error("RSS parsing error:", error);
    return NextResponse.json(
      { error: "RSS feed işlenirken hata oluştu" },
      { status: 500 }
    );
  }
}
