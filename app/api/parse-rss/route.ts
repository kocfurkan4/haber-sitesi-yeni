import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
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
        { error: "RSS URL gerekli" },
        { status: 400 }
      );
    }

    const feed = await parser.parseURL(url);

    const articles = feed.items.map((item: any) => {
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

      return {
        id: item.guid || item.link || `${Date.now()}-${Math.random()}`,
        title: item.title || "Başlıksız",
        summary: cleanContent.substring(0, 200) + (cleanContent.length > 200 ? "..." : ""),
        content: cleanContent,
        image: imageUrl,
        source: feed.title || "Bilinmeyen Kaynak",
        category: item.categories?.[0] || "Genel",
        date: item.pubDate || new Date().toISOString(),
        interestScore: 7,
        isSent: false,
        sourceUrl: item.link || "#",
      };
    });

    return NextResponse.json({
      success: true,
      source: feed.title || "Bilinmeyen Kaynak",
      articles,
    });
  } catch (error: any) {
    console.error("RSS parsing error:", error);
    return NextResponse.json(
      { error: "RSS feed parse edilemedi: " + error.message },
      { status: 500 }
    );
  }
}
