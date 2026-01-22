import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"], // Full article content
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

/**
 * Simple English language detection
 * Checks for common English words
 */
function isEnglish(text: string): boolean {
  if (!text || text.length < 50) return false;

  const lowerText = text.toLowerCase();
  const commonEnglishWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
    'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
    'its', 'let', 'put', 'say', 'she', 'too', 'use', 'with', 'said', 'have',
    'from', 'this', 'that', 'they', 'what', 'been', 'more', 'when', 'will',
    'your', 'about', 'after', 'could', 'their', 'would', 'these', 'which'
  ];

  // Count English word matches
  let matches = 0;
  const words = lowerText.split(/\s+/);

  for (const word of words.slice(0, 100)) { // Check first 100 words
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (commonEnglishWords.includes(cleanWord)) {
      matches++;
    }
  }

  // If more than 20% of words are common English words, consider it English
  const matchRate = matches / Math.min(words.length, 100);
  return matchRate > 0.2;
}

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

    // First, create articles from RSS data
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

          // Clean up content - prioritize content:encoded for full article text
          // Try multiple ways to access content:encoded (different parsers handle namespaces differently)
          const itemAny = item as any;
          const rawContent =
            item.contentEncoded ||
            itemAny['content:encoded'] ||
            item.content ||
            item.contentSnippet ||
            itemAny.description ||
            "";

          // Strip HTML tags but preserve paragraph breaks
          let cleanContent = rawContent
            .replace(/<\/p>/gi, "\n\n") // Preserve paragraphs
            .replace(/<br\s*\/?>/gi, "\n") // Preserve line breaks
            .replace(/<[^>]*>/g, "") // Remove all HTML tags
            .replace(/&nbsp;/g, " ") // Replace nbsp with space
            .replace(/&quot;/g, '"') // Replace quotes
            .replace(/&amp;/g, "&") // Replace ampersand
            .replace(/&lt;/g, "<") // Replace less than
            .replace(/&gt;/g, ">") // Replace greater than
            .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
            .trim();

          // Generate tags from categories or title
          const tags = item.categories && Array.isArray(item.categories)
            ? item.categories.slice(0, 5)
            : [];

          // Generate a better summary (first 2-3 sentences or 500 chars)
          const summaryLength = 500;
          let summary = cleanContent.substring(0, summaryLength);

          // Try to end at a sentence boundary
          const lastPeriod = summary.lastIndexOf('.');
          const lastQuestion = summary.lastIndexOf('?');
          const lastExclaim = summary.lastIndexOf('!');
          const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclaim);

          if (lastSentence > 200) {
            // If we found a sentence ending after 200 chars, use it
            summary = summary.substring(0, lastSentence + 1);
          } else {
            // Otherwise just truncate and add ellipsis
            summary = summary + (cleanContent.length > summaryLength ? "..." : "");
          }

          return {
            id: item.guid || item.link || `${Date.now()}-${Math.random()}`,
            title: (item.title || "Başlıksız").substring(0, 200),
            summary: summary,
            content: cleanContent.substring(0, 15000), // Increased to 15000 for full articles
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

    // Try to fetch full content ONLY for articles with short content (< 500 chars)
    // Sites like Breaking Defense already provide full text in content:encoded
    const articlesWithFullContent = await Promise.allSettled(
      articles.map(async (article: any) => {
        // Skip scraping if content is already long enough
        if (article.content.length > 500) {
          console.log(`✓ Skipping scraping (RSS has full content): ${article.title.substring(0, 50)}...`);
          return article;
        }

        try {
          // Try to scrape full content with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          console.log(`🌐 Attempting to scrape: ${article.title.substring(0, 50)}...`);

          const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scrape-article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: article.sourceUrl }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (scrapeResponse.ok) {
            const { content } = await scrapeResponse.json();
            if (content && content.length > article.content.length) {
              console.log(`✅ Full content scraped for: ${article.title.substring(0, 50)}...`);
              return { ...article, content };
            }
          }
        } catch (error) {
          // Silently ignore scraping failures - use RSS content
          console.log(`⚠️ Scraping failed, using RSS content for: ${article.title.substring(0, 50)}...`);
        }

        return article;
      })
    );

    // Extract successful results
    let finalArticles = articlesWithFullContent
      .filter((result: any) => result.status === 'fulfilled')
      .map((result: any) => result.value);

    // Auto-translate English articles to Turkish
    // Get Gemini API key from Vercel KV (if available)
    try {
      const settings = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/settings`).then(r => r.json());
      const geminiApiKey = settings?.gemini_api_key;

      if (geminiApiKey) {
        const translationResults = await Promise.allSettled(
          finalArticles.map(async (article: any) => {
            // Detect if article is in English
            if (isEnglish(article.title + ' ' + article.content)) {
              try {
                console.log(`🌍 Translating English article: ${article.title.substring(0, 50)}...`);

                // Translate title
                const titleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/translate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    text: article.title,
                    targetLang: 'tr',
                    apiKey: geminiApiKey
                  }),
                  signal: AbortSignal.timeout(10000)
                });

                // Translate content (first 3000 chars for better coverage)
                const contentToTranslate = article.content.substring(0, 3000);
                const contentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/translate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    text: contentToTranslate,
                    targetLang: 'tr',
                    apiKey: geminiApiKey
                  }),
                  signal: AbortSignal.timeout(15000)
                });

                if (titleResponse.ok && contentResponse.ok) {
                  const { translatedText: translatedTitle } = await titleResponse.json();
                  const { translatedText: translatedContent } = await contentResponse.json();

                  console.log(`✅ Article translated: ${translatedTitle.substring(0, 50)}...`);

                  // Generate Turkish summary from translated content (first 2-3 sentences or 500 chars)
                  const summaryLength = 500;
                  let translatedSummary = translatedContent.substring(0, summaryLength);

                  // Try to end at a sentence boundary
                  const lastPeriod = translatedSummary.lastIndexOf('.');
                  const lastQuestion = translatedSummary.lastIndexOf('?');
                  const lastExclaim = translatedSummary.lastIndexOf('!');
                  const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclaim);

                  if (lastSentence > 200) {
                    translatedSummary = translatedSummary.substring(0, lastSentence + 1);
                  } else {
                    translatedSummary = translatedSummary + (translatedContent.length > summaryLength ? "..." : "");
                  }

                  return {
                    ...article,
                    title: translatedTitle,
                    content: translatedContent + (article.content.length > 3000 ? '...' : ''),
                    summary: translatedSummary,
                    originalLanguage: 'en'
                  };
                }
              } catch (error) {
                console.log(`⚠️ Translation failed for: ${article.title.substring(0, 50)}...`);
              }
            }
            return article;
          })
        );

        finalArticles = translationResults
          .filter((result: any) => result.status === 'fulfilled')
          .map((result: any) => result.value);
      }
    } catch (error) {
      console.log('⚠️ Auto-translation skipped (settings not available)');
    }

    console.log(`📰 RSS parsed: ${finalArticles.length} articles (${finalArticles.filter((a: any) => a.content.length > 300).length} with full content)`);

    return NextResponse.json({
      success: true,
      source: feed.title || "Bilinmeyen Kaynak",
      articles: finalArticles,
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
