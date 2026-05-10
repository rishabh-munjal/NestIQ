// app/api/ai-invest/route.ts
// AI Investment Advisor — Live Gemini AI + Anakin Agentic Search

import { NextResponse } from 'next/server';
import { MOCK_INVESTMENT_REPORT, InvestmentReport } from '@/lib/ai/investmentAdvisor';
import { agenticSearch, MOCK_NEWS_FEED, INVESTMENT_RESEARCH_QUERIES } from '@/lib/scraper/anakin';
import { bangaloreAreas } from '@/lib/data/bangaloreAreas';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const ANAKIN_KEY = process.env.ANAKIN_API_KEY || '';

// Cache report for 45 minutes
let reportCache: { data: InvestmentReport; fetchedAt: number } | null = null;
const CACHE_TTL = 45 * 60 * 1000;

// ============================
// Step 1: Gather intel via Anakin Agentic Search
// ============================
async function gatherMarketIntel(customQuery?: string): Promise<string[]> {
  const signals: string[] = [];

  if (!ANAKIN_KEY) {
    console.log('[Invest] No Anakin key — using mock news signals');
    return MOCK_NEWS_FEED.slice(0, 6).map((n) => `${n.title}: ${n.summary}`);
  }

  // Pick the most relevant query (or use custom)
  const query = customQuery
    ? `Bangalore real estate investment: ${customQuery}`
    : INVESTMENT_RESEARCH_QUERIES[Math.floor(Math.random() * INVESTMENT_RESEARCH_QUERIES.length)];

  try {
    console.log('[Invest] Running agentic search:', query);

    // Race against a 45-second timeout to keep the API responsive
    const searchPromise = agenticSearch(query);
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Agentic search timed out after 45s')), 45000)
    );

    const result = await Promise.race([searchPromise, timeoutPromise]);
    if (result && typeof result === 'object' && 'summary' in result) {
      console.log('[Invest] Agentic search done, summary length:', result.summary?.length);
      if (result.summary) {
        signals.push(`LIVE MARKET RESEARCH: ${result.summary}`);
      }
    }
  } catch (err) {
    console.error('[Invest] Agentic search failed/timed-out, using mock signals:', err);
  }

  // Always add curated signals as baseline
  const curatedSignals = MOCK_NEWS_FEED.slice(0, 5).map(
    (n) => `${n.title}: ${n.summary}`
  );
  signals.push(...curatedSignals);
  return signals;
}

// ============================
// Step 2: Generate investment report via Gemini
// ============================
async function generateWithGemini(
  newsSignals: string[],
  customQuery?: string
): Promise<InvestmentReport> {
  if (!GEMINI_KEY) {
    console.log('[Invest] No Gemini key — using mock report');
    return MOCK_INVESTMENT_REPORT;
  }

  const areasData = bangaloreAreas
    .slice(0, 15)
    .map(
      (a) =>
        `${a.name}: ₹${a.avgPricePerSqft}/sqft, +${a.oneYearChange}% 1Y, ${a.rentalYield}% yield, score ${a.investmentScore}/100, zone: ${a.zone}, tier: ${a.tier}`
    )
    .join('\n');

  const prompt = `You are Bangalore's #1 real estate investment analyst with deep expertise in Karnataka property markets.

CURRENT MARKET INTELLIGENCE:
${newsSignals.map((s, i) => `${i + 1}. ${s}`).join('\n')}

BANGALORE AREA DATA (live):
${areasData}

${customQuery ? `USER QUERY: ${customQuery}\n` : ''}

Generate a comprehensive real estate investment report for Bangalore. Return ONLY valid JSON in this exact structure:

{
  "marketSummary": "3-4 sentence market overview with specific data points",
  "marketOutlook": "Bullish" | "Neutral" | "Cautious",
  "newsSignals": ["5 key market signals as emoji-prefixed strings"],
  "topPick": "areaId from the list below",
  "opportunities": [
    {
      "rank": 1,
      "areaId": "exact-id-from-list",
      "areaName": "Area Name",
      "recommendationType": "Buy Now" | "Watch & Buy" | "Hold" | "Premium Buy",
      "expectedROI": "XX-XX%",
      "timeHorizon": "X-X years",
      "riskLevel": "Low" | "Medium" | "High",
      "currentPricePerSqft": NUMBER,
      "targetPricePerSqft": NUMBER,
      "confidence": NUMBER_0_TO_100,
      "keyDrivers": ["driver1", "driver2", "driver3"],
      "risks": ["risk1", "risk2"],
      "bestFor": "target buyer description",
      "aiInsight": "2-3 sentence deep insight paragraph"
    }
  ]
}

Area IDs to use: whitefield, koramangala, hsr-layout, electronic-city, sarjapur-road, indiranagar, yelahanka, hebbal, jp-nagar, bannerghatta-road, marathahalli, bellandur, jayanagar, btm-layout, hennur-road, kengeri, nagavara, devanahalli, yeshwanthpur, rajajinagar

Return EXACTLY 5 opportunities ranked 1-5 by conviction. Return ONLY the JSON, no other text.`;

  try {
    console.log('[Invest] Calling Gemini API...');
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429) {
        console.log('[Invest] Gemini quota exceeded — serving curated report');
        return { ...MOCK_INVESTMENT_REPORT, generatedAt: new Date().toISOString() };
      }
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    const data = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[Invest] Gemini response length:', rawText.length);

    // Extract JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');

    const report = JSON.parse(jsonMatch[0]) as Partial<InvestmentReport>;
    return {
      ...MOCK_INVESTMENT_REPORT, // fallback defaults
      ...report,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[Invest] Gemini generation failed:', err);
    return { ...MOCK_INVESTMENT_REPORT, generatedAt: new Date().toISOString() };
  }
}

// ============================
// API Routes
// ============================
export async function GET() {
  // Use cache if fresh
  if (reportCache && Date.now() - reportCache.fetchedAt < CACHE_TTL) {
    console.log('[Invest] Serving cached report');
    return NextResponse.json(reportCache.data);
  }

  try {
    const signals = await gatherMarketIntel();
    const report = await generateWithGemini(signals);
    reportCache = { data: report, fetchedAt: Date.now() };
    return NextResponse.json(report);
  } catch (err) {
    console.error('[Invest] Report generation error:', err);
    return NextResponse.json(MOCK_INVESTMENT_REPORT);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: string; refresh?: boolean };
    const { query, refresh } = body;

    // Force refresh if requested
    if (refresh) reportCache = null;

    const signals = await gatherMarketIntel(query);
    const report = await generateWithGemini(signals, query);

    // Cache non-custom-query reports
    if (!query) {
      reportCache = { data: report, fetchedAt: Date.now() };
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error('[Invest] POST error:', err);
    return NextResponse.json(MOCK_INVESTMENT_REPORT);
  }
}
