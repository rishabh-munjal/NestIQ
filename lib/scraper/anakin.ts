// lib/scraper/anakin.ts
// Anakin.io API client — URL Scraper + Agentic Search
// Docs: https://anakin.io/llms-full.txt

const ANAKIN_API_BASE = 'https://api.anakin.io/v1';
const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY || '';

// ============================
// Helpers
// ============================

async function anakinFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ANAKIN_API_BASE}${path}`, {
    ...options,
    headers: {
      'X-API-Key': ANAKIN_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return res;
}

// Poll a job until completed or failed
async function pollJob(
  endpoint: string,
  jobId: string,
  intervalMs = 4000,
  maxWaitMs = 90000
): Promise<Record<string, unknown>> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const res = await anakinFetch(`${endpoint}/${jobId}`);
    const data = await res.json() as Record<string, unknown>;
    if (data.status === 'completed') return data;
    if (data.status === 'failed') throw new Error(`Job failed: ${data.error}`);
  }
  throw new Error(`Job ${jobId} timed out after ${maxWaitMs / 1000}s`);
}

// ============================
// URL Scraper  (async: submit → poll)
// ============================
export async function scrapeUrl(
  url: string,
  opts: { useBrowser?: boolean; prompt?: string; country?: string } = {}
): Promise<{ markdown: string; html?: string; url: string }> {
  // Submit scrape job
  const submitRes = await anakinFetch('/url-scraper', {
    method: 'POST',
    body: JSON.stringify({
      url,
      useBrowser: opts.useBrowser ?? false,
      country: opts.country ?? 'in',
      ...(opts.prompt ? { extractionPrompt: opts.prompt } : {}),
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Anakin URL scraper submit failed (${submitRes.status}): ${err}`);
  }

  const submitData = await submitRes.json() as { jobId?: string; id?: string };
  const jobId = submitData.jobId ?? submitData.id;
  if (!jobId) throw new Error('No jobId returned from URL scraper');

  // Poll for result
  const result = await pollJob('/url-scraper', jobId);
  return {
    url,
    markdown: (result.markdown as string) || '',
    html: result.html as string | undefined,
  };
}

// ============================
// Agentic Search (async: submit → poll)
// ============================
export async function agenticSearch(prompt: string): Promise<{
  summary: string;
  structured_data: Record<string, unknown>;
}> {
  const submitRes = await anakinFetch('/agentic-search', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Anakin agentic search submit failed (${submitRes.status}): ${err}`);
  }

  const submitData = await submitRes.json() as { job_id?: string };
  const jobId = submitData.job_id;
  if (!jobId) throw new Error('No job_id from agentic search');

  const result = await pollJob('/agentic-search', jobId, 10000, 180000);
  const generated = result.generatedJson as { summary: string; structured_data: Record<string, unknown> };
  return {
    summary: generated?.summary || '',
    structured_data: generated?.structured_data || {},
  };
}

// ============================
// Bangalore Real Estate Scraping
// ============================

// Sources to scrape for Bangalore real estate news (ordered by scraping reliability)
export const NEWS_SOURCES = [
  {
    url: 'https://www.99acres.com/real-estate-insights/category/bangalore',
    name: '99acres',
    useBrowser: false,
  },
  {
    url: 'https://www.squareyards.com/blog/category/real-estate-news',
    name: 'SquareYards',
    useBrowser: false,
  },
  {
    url: 'https://www.nobroker.in/blog/real-estate-news/',
    name: 'NoBroker',
    useBrowser: false,
  },
];

// Government / infrastructure news
export const INFRA_SOURCES = [
  {
    url: 'https://bmrc.co.in/press-releases',
    name: 'BMRC',
    prompt: 'Extract all press releases about Bangalore Metro expansion, new stations, Phase 2, Phase 3 corridors, and timelines.',
  },
];

export interface ScrapedNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  affectedAreas: string[];
  impactScore: number;
  tags: string[];
}

// Parse raw scraped markdown into news items using Gemini
export async function parseScrapedNewsWithGemini(
  rawMarkdown: string,
  sourceName: string
): Promise<ScrapedNewsItem[]> {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
  if (!GEMINI_KEY) return [];

  // Take a meaningful chunk of content
  const content = rawMarkdown.slice(0, 10000);

  const prompt = `You are a real estate data extractor. Extract news articles from this web content scraped from ${sourceName}.

CONTENT:
${content}

TASK: Find up to 6 real estate news items. For each item you find, create a JSON object.
If any item mentions Bangalore or Karnataka, mark it as relevant.
Even if you don't see explicit Bangalore mentions, include general Indian real estate news.

Return a JSON array (even if only 1-2 items found). Each object must have ALL these exact fields:
[
  {
    "title": "The news headline (string)",
    "summary": "A 2-3 sentence summary of the news (string)",
    "sentiment": "Bullish",
    "affectedAreas": ["Whitefield"],
    "impactScore": 75,
    "tags": ["Real Estate", "India"],
    "publishedAt": "2025-05-10T00:00:00Z"
  }
]

Rules:
- sentiment MUST be one of: "Bullish", "Bearish", or "Neutral"
- impactScore MUST be a number between 1 and 100
- affectedAreas MUST be a non-empty array of strings
- publishedAt MUST be a valid ISO date string
- Return ONLY the JSON array, no other text, no markdown code blocks`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 3000,
          },
        }),
      }
    );

    const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    // Try multiple JSON extraction strategies
    let parsed: Array<Omit<ScrapedNewsItem, 'id' | 'source' | 'url'>> = [];
    try {
      // Strategy 1: direct parse
      parsed = JSON.parse(text);
    } catch {
      try {
        // Strategy 2: extract array
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) parsed = JSON.parse(arrayMatch[0]);
      } catch {
        console.error('[Anakin] Could not parse Gemini JSON response');
        return [];
      }
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(item => item && typeof item.title === 'string' && item.title.length > 5)
      .map((item, i) => ({
        id: `scraped-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
        source: sourceName,
        url: '#',
        title: item.title || 'Real Estate News',
        summary: item.summary || '',
        sentiment: (['Bullish', 'Bearish', 'Neutral'].includes(item.sentiment as string)
          ? item.sentiment
          : 'Neutral') as 'Bullish' | 'Bearish' | 'Neutral',
        affectedAreas: Array.isArray(item.affectedAreas) && item.affectedAreas.length > 0
          ? item.affectedAreas
          : ['Bangalore'],
        impactScore: typeof item.impactScore === 'number'
          ? Math.min(100, Math.max(1, item.impactScore))
          : 65,
        tags: Array.isArray(item.tags) ? item.tags : ['Real Estate'],
        publishedAt: item.publishedAt || new Date().toISOString(),
      }));
  } catch (err) {
    console.error('[Anakin] Gemini parse error:', err);
    return [];
  }
}


// ============================
// Agentic Investment Research
// ============================

export const INVESTMENT_RESEARCH_QUERIES = [
  'Bangalore metro Phase 3 new stations 2025 real estate property price impact Sarjapur Hebbal Yelahanka',
  'BBMP master plan 2031 Bangalore residential zoning new developments investment opportunities',
  'Bangalore IT sector growth 2025 new offices Whitefield Electronic City Devanahalli property demand',
  'BIAL IT investment region Devanahalli airport city development 2025 property prices',
  'Namma Metro expansion new stations 2025 Bangalore property appreciation areas',
];

// ============================
// Mock fallback (used when API key missing or scraping fails)
// ============================
export const MOCK_NEWS_FEED: ScrapedNewsItem[] = [
  {
    id: 'n1',
    title: 'Namma Metro Phase 3: Hebbal–Sarjapur corridor gets Cabinet approval',
    summary: 'The Karnataka Cabinet has approved the 44.65 km Namma Metro Phase 3 project connecting North and South Bangalore. The corridor through Hebbal, MG Road, and Sarjapur Road is expected to boost property prices by 15–25% in affected micro-markets.',
    source: 'Times of India',
    url: 'https://timesofindia.indiatimes.com',
    publishedAt: '2025-05-08T08:00:00Z',
    sentiment: 'Bullish',
    affectedAreas: ['Hebbal', 'Sarjapur Road', 'Koramangala', 'HSR Layout'],
    impactScore: 92,
    tags: ['Metro', 'Infrastructure', 'North Bangalore', 'South Bangalore'],
  },
  {
    id: 'n2',
    title: 'BBMP Master Plan 2031: 10,000 acres rezoned for high-density residential',
    summary: 'BBMP has released draft Master Plan 2031 rezoning major areas in North and East Bangalore for high-density residential development. Yelahanka, Hennur Road, and Devanahalli to see major new project launches in coming years.',
    source: 'Economic Times',
    url: 'https://economictimes.indiatimes.com',
    publishedAt: '2025-05-07T10:30:00Z',
    sentiment: 'Bullish',
    affectedAreas: ['Yelahanka', 'Hennur Road', 'Devanahalli', 'Nagawara'],
    impactScore: 88,
    tags: ['BBMP', 'Master Plan', 'Zoning', 'North Bangalore'],
  },
  {
    id: 'n3',
    title: 'Whitefield property prices surge 12% YoY amid ITPL expansion drive',
    summary: 'Average property prices in Whitefield have surged 12% year-on-year following expansion of ITPL and new hiring drives at major IT companies. Rental yields remain strong at 3.2%, making it one of the top income-generating areas.',
    source: 'MagicBricks',
    url: 'https://magicbricks.com',
    publishedAt: '2025-05-06T09:00:00Z',
    sentiment: 'Bullish',
    affectedAreas: ['Whitefield', 'Marathahalli', 'Bellandur'],
    impactScore: 75,
    tags: ['IT Hub', 'Whitefield', 'Appreciation', 'Rental Yield'],
  },
  {
    id: 'n4',
    title: 'Karnataka extends stamp duty concession for women buyers till March 2026',
    summary: "Karnataka government extends 1% stamp duty concession for women property buyers till March 2026. This saves ₹1–2 lakhs on an average apartment purchase and is expected to boost women buyers' share in the market.",
    source: 'The Hindu',
    url: 'https://thehindu.com',
    publishedAt: '2025-05-05T11:00:00Z',
    sentiment: 'Bullish',
    affectedAreas: ['All Bangalore'],
    impactScore: 70,
    tags: ['Stamp Duty', 'Government Policy', 'Women Buyers'],
  },
  {
    id: 'n5',
    title: 'NGT lake encroachment orders create uncertainty in Bellandur–Varthur zone',
    summary: "NGT orders on lake encroachment in Bellandur–Varthur area have created uncertainty. Some projects near lake boundary may face demolition notices. Buyers advised caution before purchasing in the zone.",
    source: 'Deccan Herald',
    url: 'https://deccanherald.com',
    publishedAt: '2025-05-04T14:00:00Z',
    sentiment: 'Bearish',
    affectedAreas: ['Bellandur', 'Varthur'],
    impactScore: 60,
    tags: ['NGT', 'Lake Encroachment', 'Risk', 'Bellandur'],
  },
  {
    id: 'n6',
    title: 'Electronic City Metro Phase 2 construction on track — completion by 2027',
    summary: 'BMRC confirms the Electronic City metro corridor is progressing on schedule. The 19.15 km stretch will connect Electronic City directly to Central Bangalore, dramatically reducing commute times and boosting property prices.',
    source: 'BMRC Press Release',
    url: 'https://bmrc.co.in',
    publishedAt: '2025-05-03T10:00:00Z',
    sentiment: 'Bullish',
    affectedAreas: ['Electronic City', 'Bommanahalli', 'HSR Layout'],
    impactScore: 85,
    tags: ['Metro', 'Electronic City', 'Infrastructure', 'IT'],
  },
  {
    id: 'n7',
    title: 'K-RERA penalises 47 Bangalore projects for delayed possession beyond deadline',
    summary: 'K-RERA has issued penalty notices to 47 Bangalore projects for delayed possession beyond the promised date. Buyers of affected projects are eligible for interest compensation under Section 18 of the RERA Act.',
    source: 'K-RERA Official',
    url: 'https://rera.karnataka.gov.in',
    publishedAt: '2025-05-02T09:00:00Z',
    sentiment: 'Neutral',
    affectedAreas: ['Multiple areas'],
    impactScore: 50,
    tags: ['RERA', 'Penalty', 'Delivery Delay', 'Buyer Rights'],
  },
  {
    id: 'n8',
    title: 'Devanahalli STRR project: Land acquisition at 90%, road opens 2026',
    summary: 'The Suburban Ring Road (STRR) project land acquisition is 90% complete in the Devanahalli–Hoskote stretch. Completion expected by 2026, creating a massive infrastructure boost for North Bangalore and the airport corridor.',
    source: 'Economic Times',
    url: 'https://economictimes.indiatimes.com',
    publishedAt: '2025-05-01T08:30:00Z',
    sentiment: 'Bullish',
    affectedAreas: ['Devanahalli', 'Yelahanka', 'Hoskote', 'North Bangalore'],
    impactScore: 87,
    tags: ['STRR', 'Ring Road', 'Infrastructure', 'Devanahalli'],
  },
];

export type NewsItem = ScrapedNewsItem;
