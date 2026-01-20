import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000, // 10 second timeout
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
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "RSS URL gerekli", success: false, articles: [] },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "Geçersiz URL formatı", success: false, articles: [] },
        { status: 400 }
      );
    }

    let feed;
    try {
      feed = await parser.parseURL(url);
    } catch (parseError: any) {
      console.error("RSS parse error for", url, ":", parseError.message);
      // Return empty array instead of error - don't fail the whole process
      return NextResponse.json({
        success: false,
        error: `RSS feed okunamadı: ${parseError.message}`,
        source: url,
        articles: [],
      });
    }

    // Safely handle feed items
    if (!feed || !feed.items || !Array.isArray(feed.items)) {
      return NextResponse.json({
        success: false,
        error: "RSS feed boş veya geçersiz",
        source: feed?.title || url,
        articles: [],
      });
    }

    const articles = feed.items
      .filter((item: any) => item && (item.title || item.link))
      .map((item: any) => {
        try {
          // Extract image from various possible sources
          let imageUrl = "/placeholder-news.jpg";

          if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
          } else if (item.mediaContent && item.mediaContent.$?.url) {
            imageUrl = item.mediaContent.$.url;
          } else if (item.mediaThumbnail && item.mediaThumbnail.$?.url) {
            imageUrl = item.mediaThumbnail.$.url;
          }

          // Clean up content
          const content = item.contentSnippet || item.content || item.description || "";
          const cleanContent = content.replace(/<[^>]*>/g, "").trim();

          // Generate tags from categories or title
          const tags = item.categories && Array.isArray(item.categories)
            ? item.categories.slice(0, 5)
            : [];

          return {
            id: item.guid || item.link || `${Date.now()}-${Math.random()}`,
            title: (item.title || "Başlıksız").substring(0, 200),
            summary: cleanContent.substring(0, 200) + (cleanContent.length > 200 ? "..." : ""),
            content: cleanContent.substring(0, 1000),
            image: imageUrl,
            source: feed.title || "Bilinmeyen Kaynak",
            category: (item.categories && item.categories[0]) || "Genel",
            date: item.pubDate || item.isoDate || new Date().toISOString(),
            interestScore: 7,
            isSent: false,
            sourceUrl: item.link || "#",
            tags: tags,
          };
        } catch (itemError) {
          console.error("Error processing RSS item:", itemError);
          return null;
        }
      })
      .filter((article: any) => article !== null);

    return NextResponse.json({
      success: true,
      source: feed.title || "Bilinmeyen Kaynak",
      articles: articles,
    });
  } catch (error: any) {
    console.error("RSS parsing error:", error);
    // Return empty array instead of 500 error
    return NextResponse.json({
      success: false,
      error: "RSS feed işlenirken hata oluştu: " + (error.message || "Bilinmeyen hata"),
      articles: [],
    });
  }
}
