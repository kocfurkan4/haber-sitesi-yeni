import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

/**
 * POST /api/scrape-article
 * Web scraping ile makale içeriğini çeker
 * - Vercel KV ile caching (aynı URL için tekrar scraping yapılmaz)
 * - HTML'den article içeriğini extract eder
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL gereklidir' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Geçersiz URL formatı' },
        { status: 400 }
      );
    }

    // Cache key oluştur
    const urlHash = crypto.createHash('md5').update(url).digest('hex');
    const cacheKey = `scrape:${urlHash}`;

    // Cache'e bak
    const cachedContent = await kv.get<string>(cacheKey);
    if (cachedContent) {
      console.log('✅ Cache hit! Scrape cache\'den döndürülüyor:', {
        cacheKey,
        contentLength: cachedContent.length
      });
      return NextResponse.json({
        content: cachedContent,
        cached: true
      });
    }

    console.log('🌐 Web scraping başlıyor:', { url });

    // Fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract article content using multiple strategies
    let content = '';

    // Strategy 1: Look for <article> tag
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = extractTextFromHTML(articleMatch[1]);
    }

    // Strategy 2: Look for main content div (common patterns)
    if (!content || content.length < 200) {
      const patterns = [
        // Defense News specific patterns
        /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*story-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        // Generic patterns
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

    // Strategy 3: Fallback - extract all <p> tags
    if (!content || content.length < 200) {
      const pTags = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (pTags) {
        content = pTags
          .map(tag => extractTextFromHTML(tag))
          .filter(text => text.length > 50) // Filter out short paragraphs
          .join('\n\n');
      }
    }

    // Clean up
    content = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .trim();

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: 'Makale içeriği çıkarılamadı. Site yapısı desteklenmiyor olabilir.' },
        { status: 500 }
      );
    }

    // Limit content to 20000 characters (increased for full articles)
    if (content.length > 20000) {
      content = content.substring(0, 20000) + '...';
    }

    console.log('✅ Scraping başarılı:', {
      url,
      contentLength: content.length
    });

    // Cache'e kaydet (7 gün)
    await kv.set(cacheKey, content, { ex: 7 * 24 * 60 * 60 });

    return NextResponse.json({
      content,
      cached: false
    });

  } catch (error: any) {
    console.error('❌ Scraping error:', error);

    let errorMessage = error.message || 'Web scraping hatası';

    if (errorMessage.includes('timeout')) {
      errorMessage = 'Sayfa yüklenemedi (timeout). Lütfen tekrar deneyin.';
    } else if (errorMessage.includes('fetch')) {
      errorMessage = 'Siteye erişilemedi. Site engelliyor olabilir.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * HTML'den text extract eder (HTML taglarını temizler)
 */
function extractTextFromHTML(html: string): string {
  return html
    // Remove script and style tags with their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
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
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
