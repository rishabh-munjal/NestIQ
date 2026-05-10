// app/api/scrape/route.ts
// On-demand scraping endpoint — demonstrates Anakin.io integration live

import { NextResponse } from 'next/server';
import { scrapeUrl, parseScrapedNewsWithGemini } from '@/lib/scraper/anakin';

export async function POST(request: Request) {
  const ANAKIN_KEY = process.env.ANAKIN_API_KEY;
  if (!ANAKIN_KEY) {
    return NextResponse.json({ error: 'ANAKIN_API_KEY not configured' }, { status: 503 });
  }

  const body = await request.json() as { url?: string };
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  try {
    const startTime = Date.now();
    const scraped = await scrapeUrl(url, { useBrowser: false, country: 'in' });
    const durationMs = Date.now() - startTime;

    // Try to parse as news if Gemini key is available
    let parsedItems: unknown[] = [];
    if (process.env.GEMINI_API_KEY && scraped.markdown.length > 200) {
      parsedItems = await parseScrapedNewsWithGemini(scraped.markdown, new URL(url).hostname);
    }

    return NextResponse.json({
      success: true,
      url,
      durationMs,
      contentLength: scraped.markdown.length,
      preview: scraped.markdown.slice(0, 1000),
      parsedNewsItems: parsedItems,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
