// app/api/news/route.ts
// Live Bangalore real estate news — scraped via Anakin.io + parsed by Gemini

import { NextResponse } from 'next/server';
import {
  scrapeUrl,
  parseScrapedNewsWithGemini,
  MOCK_NEWS_FEED,
  NEWS_SOURCES,
  ScrapedNewsItem,
} from '@/lib/scraper/anakin';

const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Reset cache on every module load (dev hot reload) 
let newsCache: { data: ScrapedNewsItem[]; fetchedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

async function fetchLiveNews(): Promise<ScrapedNewsItem[]> {
  // Check cache
  if (newsCache && Date.now() - newsCache.fetchedAt < CACHE_TTL) {
    console.log('[News] Serving from cache');
    return newsCache.data;
  }

  if (!ANAKIN_API_KEY) {
    console.log('[News] No Anakin key — using mock data');
    return MOCK_NEWS_FEED;
  }

  console.log('[News] Starting live scrape from', NEWS_SOURCES.length, 'sources');

  // Scrape sources (limit to 2 to save credits)
  const sourcesToScrape = NEWS_SOURCES.slice(0, 2);
  const scrapedResults = await Promise.allSettled(
    sourcesToScrape.map(async (source) => {
      console.log(`[News] Scraping: ${source.url}`);
      const scraped = await scrapeUrl(source.url, {
        useBrowser: (source as { useBrowser?: boolean }).useBrowser ?? false,
        country: 'in',
      });
      console.log(`[News] Scraped ${source.name}: ${scraped.markdown.length} chars`);

      if (!scraped.markdown || scraped.markdown.length < 100) {
        console.log(`[News] ${source.name}: too little content, skipping parse`);
        return [] as ScrapedNewsItem[];
      }

      if (!GEMINI_API_KEY) {
        console.log('[News] No Gemini key — skipping parse');
        return [] as ScrapedNewsItem[];
      }

      const items = await parseScrapedNewsWithGemini(scraped.markdown, source.name);
      console.log(`[News] ${source.name}: parsed ${items.length} news items`);
      return items;
    })
  );

  const allScraped: ScrapedNewsItem[] = [];
  for (const result of scrapedResults) {
    if (result.status === 'fulfilled') {
      allScraped.push(...result.value);
    } else {
      console.error('[News] Scrape source failed:', result.reason);
    }
  }

  // Merge with curated mock items (always include them as baseline)
  // Deduplicate by title similarity
  const combinedNews = [...allScraped, ...MOCK_NEWS_FEED];

  // Sort by impact score desc
  combinedNews.sort((a, b) => b.impactScore - a.impactScore);

  // Cache the result
  newsCache = { data: combinedNews, fetchedAt: Date.now() };
  console.log(`[News] Total news items: ${combinedNews.length} (${allScraped.length} live + ${MOCK_NEWS_FEED.length} curated)`);

  return combinedNews;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sentiment = searchParams.get('sentiment');
  const area = searchParams.get('area');
  const live = searchParams.get('live') !== 'false'; // default live=true

  try {
    let news = live ? await fetchLiveNews() : MOCK_NEWS_FEED;

    if (sentiment && sentiment !== 'All') {
      news = news.filter((n) => n.sentiment === sentiment);
    }
    if (area) {
      news = news.filter((n) =>
        n.affectedAreas.some((a) => a.toLowerCase().includes(area.toLowerCase()))
      );
    }

    return NextResponse.json({
      news,
      total: news.length,
      source: ANAKIN_API_KEY ? 'live' : 'mock',
      cachedAt: newsCache?.fetchedAt,
    });
  } catch (error) {
    console.error('[News] Error fetching live news, falling back to mock:', error);
    return NextResponse.json({
      news: MOCK_NEWS_FEED,
      total: MOCK_NEWS_FEED.length,
      source: 'mock-fallback',
      error: String(error),
    });
  }
}

// Force refresh the cache
export async function POST() {
  newsCache = null;
  try {
    const news = await fetchLiveNews();
    return NextResponse.json({ success: true, total: news.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
