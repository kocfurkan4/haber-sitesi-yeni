import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

/**
 * Universal News Fetcher API
 *
 * Supports BOTH:
 * - RSS/XML feeds (extracts links and fetches full articles)
 * - Direct article URLs (scrapes content directly)
 *
 * Returns standardized JSON with title, full_text, summary, image_url, source_link
 */

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
    ],
  },
});

interface ArticleData {
  title: string;
  full_text: string;
  summary: string;
  image_url: string;
  source_link: string;
  source_name?: string;
  published_date?: string;
  is_english?: boolean;
}

/**
 * POST /api/universal-fetcher
 * Body: { url: string, geminiApiKey?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { url, geminiApiKey } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL gereklidir' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Geçersiz URL formatı' },
        { status: 400 }
      );
    }

    // Check cache first
    const urlHash = crypto.createHash('md5').update(url).digest('hex');
    const cacheKey = `universal:${urlHash}`;
    const cachedData = await kv.get<ArticleData[]>(cacheKey);

    if (cachedData) {
      console.log('✅ Cache hit! Universal fetcher cache\'den döndürülüyor');
      return NextResponse.json({
        articles: cachedData,
        cached: true
      });
    }

    // Detect if URL is RSS feed or direct article
    const isRSSFeed = await detectRSSFeed(url);

    let articles: ArticleData[] = [];

    if (isRSSFeed) {
      console.log('📰 RSS feed tespit edildi, parsing başlıyor...');
      articles = await fetchFromRSS(url, geminiApiKey);
    } else {
      console.log('🌐 Direkt haber linki tespit edildi, scraping başlıyor...');
      const article = await fetchFromDirectURL(url, geminiApiKey);
      if (article) {
        articles = [article];
      }
    }

    // Cache for 6 hours
    if (articles.length > 0) {
      await kv.set(cacheKey, articles, { ex: 6 * 60 * 60 });
    }

    return NextResponse.json({
      articles,
      cached: false,
      source_type: isRSSFeed ? 'rss' : 'direct'
    });

  } catch (error: any) {
    console.error('❌ Universal fetcher error:', error);
    return NextResponse.json(
      { error: error.message || 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * Detect if URL is an RSS feed or direct article link
 */
async function detectRSSFeed(url: string): Promise<boolean> {
  try {
    // Check URL patterns
    if (url.includes('/rss') || url.includes('/feed') || url.includes('.xml') || url.includes('outputType=xml')) {
      return true;
    }

    // Fetch first 1KB to check content type
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('xml') || contentType.includes('rss') || contentType.includes('atom')) {
      return true;
    }

    return false;
  } catch (error) {
    console.log('⚠️ RSS detection failed, defaulting to direct URL');
    return false;
  }
}

/**
 * Fetch articles from RSS feed
 */
async function fetchFromRSS(rssUrl: string, geminiApiKey?: string): Promise<ArticleData[]> {
  try {
    const feed = await parser.parseURL(rssUrl);
    const articles: ArticleData[] = [];

    // Limit to first 10 articles to avoid timeout
    const itemsToProcess = feed.items.slice(0, 10);

    console.log(`📋 ${itemsToProcess.length} makale işlenecek...`);

    for (const item of itemsToProcess) {
      try {
        const itemAny = item as any;

        // Get article link
        const articleUrl = item.link;
        if (!articleUrl) {
          console.log('⚠️ Link bulunamadı, atlanıyor');
          continue;
        }

        // Extract content from RSS (if available)
        const rssContent =
          item.contentEncoded ||
          itemAny['content:encoded'] ||
          item.content ||
          item.contentSnippet ||
          itemAny.description ||
          '';

        const cleanRSSContent = cleanHTML(rssContent);

        // Decide whether to scrape
        let fullText = cleanRSSContent;

        // Scrape if RSS content is short (<500 chars)
        if (cleanRSSContent.length < 500) {
          console.log(`🌐 RSS içeriği kısa, scraping yapılıyor: ${item.title?.substring(0, 50)}...`);
          const scrapedContent = await scrapeArticle(articleUrl);
          if (scrapedContent && scrapedContent.length > fullText.length) {
            fullText = scrapedContent;
          }
        } else {
          console.log(`✓ RSS'de tam içerik var: ${item.title?.substring(0, 50)}...`);
        }

        // Get image
        let imageUrl = '/placeholder-news.jpg';
        if (itemAny.enclosure?.url) {
          imageUrl = itemAny.enclosure.url;
        } else if (itemAny.mediaContent?.$?.url) {
          imageUrl = itemAny.mediaContent.$.url;
        } else if (itemAny.mediaThumbnail?.$?.url) {
          imageUrl = itemAny.mediaThumbnail.$.url;
        }

        // Generate summary
        const isEnglish = detectEnglish(fullText);
        let summary = truncateToSentence(fullText, 800);

        // If English and Gemini key provided, generate Turkish summary
        if (isEnglish && geminiApiKey) {
          console.log(`🌍 İngilizce içerik, Türkçe özet oluşturuluyor...`);
          const generatedSummary = await generateSummary(fullText, geminiApiKey);
          if (generatedSummary) {
            summary = generatedSummary;
          }
        }

        articles.push({
          title: item.title || 'Başlıksız',
          full_text: fullText.substring(0, 15000),
          summary: summary,
          image_url: imageUrl,
          source_link: articleUrl,
          source_name: feed.title || new URL(rssUrl).hostname,
          published_date: item.pubDate || item.isoDate || new Date().toISOString(),
          is_english: isEnglish
        });

      } catch (itemError) {
        console.error('❌ Makale işleme hatası:', itemError);
      }
    }

    return articles;
  } catch (error) {
    console.error('❌ RSS parsing hatası:', error);
    throw new Error('RSS feed ayrıştırılamadı');
  }
}

/**
 * Fetch article from direct URL
 */
async function fetchFromDirectURL(articleUrl: string, geminiApiKey?: string): Promise<ArticleData | null> {
  try {
    console.log(`🌐 Scraping: ${articleUrl}`);

    // Scrape content
    const fullText = await scrapeArticle(articleUrl);

    if (!fullText || fullText.length < 100) {
      console.error('❌ Yeterli içerik çekilemedi');
      return null;
    }

    // Try to extract title and image from HTML
    const { title, imageUrl } = await extractMetadata(articleUrl);

    // Generate summary
    const isEnglish = detectEnglish(fullText);
    let summary = truncateToSentence(fullText, 800);

    if (isEnglish && geminiApiKey) {
      console.log(`🌍 İngilizce içerik, Türkçe özet oluşturuluyor...`);
      const generatedSummary = await generateSummary(fullText, geminiApiKey);
      if (generatedSummary) {
        summary = generatedSummary;
      }
    }

    return {
      title: title || 'Başlıksız',
      full_text: fullText.substring(0, 15000),
      summary: summary,
      image_url: imageUrl || '/placeholder-news.jpg',
      source_link: articleUrl,
      source_name: new URL(articleUrl).hostname,
      is_english: isEnglish
    };

  } catch (error) {
    console.error('❌ Direct URL fetch hatası:', error);
    return null;
  }
}

/**
 * Scrape article content from URL
 */
async function scrapeArticle(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    let content = '';

    // Strategy 1: <article> tag
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = extractTextFromHTML(articleMatch[1]);
    }

    // Strategy 2: Common content divs
    if (!content || content.length < 200) {
      const patterns = [
        /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*story-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<main[^>]*>([\s\S]*?)<\/main>/i,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const extracted = extractTextFromHTML(match[1]);
          if (extracted.length > content.length) {
            content = extracted;
          }
        }
      }
    }

    // Strategy 3: All <p> tags
    if (!content || content.length < 200) {
      const pTags = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (pTags) {
        content = pTags
          .map(tag => extractTextFromHTML(tag))
          .filter(text => text.length > 50)
          .join('\n\n');
      }
    }

    return content.trim();
  } catch (error) {
    console.error('❌ Scraping hatası:', error);
    return '';
  }
}

/**
 * Extract metadata (title, image) from HTML
 */
async function extractMetadata(url: string): Promise<{ title: string, imageUrl: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    const html = await response.text();

    // Extract title
    let title = '';
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i) ||
                       html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i) ||
                       html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
      title = extractTextFromHTML(titleMatch[1]);
    }

    // Extract image
    let imageUrl = '';
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i) ||
                       html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i);
    if (imageMatch) {
      imageUrl = imageMatch[1];
    }

    return { title, imageUrl };
  } catch (error) {
    return { title: '', imageUrl: '' };
  }
}

/**
 * Clean HTML and extract text
 */
function cleanHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, "...")
    .replace(/&#(\d+);/g, (_match: string, dec: string) => String.fromCharCode(parseInt(dec)))
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract text from HTML snippet
 */
function extractTextFromHTML(html: string): string {
  return cleanHTML(html);
}

/**
 * Detect if text is in English
 */
function detectEnglish(text: string): boolean {
  const englishWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may', 'might'];
  const sample = text.toLowerCase().substring(0, 1000);

  let englishWordCount = 0;
  for (const word of englishWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = sample.match(regex);
    if (matches) {
      englishWordCount += matches.length;
    }
  }

  return englishWordCount > 5;
}

/**
 * Truncate text to max length without breaking sentences
 */
function truncateToSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Maksimum karaktere kadar al
  let truncated = text.substring(0, maxLength);

  // Son cümlenin sonunu bul (. ! ? işaretleri)
  const lastPeriod = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? ')
  );

  // Eğer uygun bir cümle sonu bulunursa orada kes (en az %70'i kullanılmışsa)
  if (lastPeriod > maxLength * 0.7) {
    return truncated.substring(0, lastPeriod + 1).trim();
  }

  // Yoksa virgülde kes
  const lastComma = truncated.lastIndexOf(', ');
  if (lastComma > maxLength * 0.7) {
    return truncated.substring(0, lastComma).trim() + '.';
  }

  // Son çare: boşlukta kes ve üç nokta ekle
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  // Hiçbiri bulunamazsa olduğu gibi döndür
  return truncated + '...';
}

/**
 * Generate Turkish summary using Gemini
 */
async function generateSummary(text: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.substring(0, 3000),
        apiKey: apiKey
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const { summary } = await response.json();
      return summary;
    }
  } catch (error) {
    console.error('❌ Özet oluşturma hatası:', error);
  }

  return '';
}
