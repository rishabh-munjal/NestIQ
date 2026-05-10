// lib/ai/investmentAdvisor.ts
// AI Investment Advisor using Google Gemini API

import { bangaloreAreas, BangaloreArea } from '@/lib/data/bangaloreAreas';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface InvestmentOpportunity {
  rank: number;
  areaId: string;
  areaName: string;
  recommendationType: 'Buy Now' | 'Watch & Buy' | 'Hold' | 'Premium Buy';
  expectedROI: string;           // e.g., "18-24%"
  timeHorizon: string;           // e.g., "2-3 years"
  riskLevel: 'Low' | 'Medium' | 'High';
  currentPricePerSqft: number;
  targetPricePerSqft: number;
  confidence: number;            // 0-100
  keyDrivers: string[];
  risks: string[];
  bestFor: string;               // e.g., "First-time buyers", "Investors"
  aiInsight: string;             // AI-generated summary paragraph
}

export interface InvestmentReport {
  generatedAt: string;
  marketSummary: string;
  opportunities: InvestmentOpportunity[];
  topPick: string;               // areaId of top pick
  marketOutlook: 'Bullish' | 'Neutral' | 'Cautious';
  newsSignals: string[];
}

// Mock report for demo without API key
export const MOCK_INVESTMENT_REPORT: InvestmentReport = {
  generatedAt: new Date().toISOString(),
  marketSummary: "Bangalore's real estate market is showing strong bullish signals in Q2 2025, driven by metro Phase 3 approvals, continued IT sector growth, and BBMP Master Plan 2031 rezoning. North Bangalore corridors — particularly Devanahalli, Hennur Road, and Yelahanka — present the highest appreciation potential as infrastructure catches up with demand. South Bangalore remains resilient with Electronic City poised for a major re-rating upon metro connectivity.",
  marketOutlook: 'Bullish',
  topPick: 'devanahalli',
  newsSignals: [
    '🚇 Metro Phase 3 corridor approved — Hebbal to Sarjapur via Central',
    '🏗️ BBMP Master Plan 2031: 10,000 acres rezoned in North Bangalore',
    '✈️ BIAL IT Investment Region: First companies moving in Q3 2025',
    '🛣️ Suburban Ring Road (STRR) land acquisition 90% complete',
    '💼 Infosys, TCS, Wipro announcing 50,000+ Bangalore hires in 2025',
  ],
  opportunities: [
    {
      rank: 1,
      areaId: 'devanahalli',
      areaName: 'Devanahalli',
      recommendationType: 'Buy Now',
      expectedROI: '35-50%',
      timeHorizon: '3-5 years',
      riskLevel: 'Medium',
      currentPricePerSqft: 3800,
      targetPricePerSqft: 6000,
      confidence: 91,
      keyDrivers: [
        'BIAL IT Investment Region — India\'s largest planned IT township (12,000 acres)',
        'Airport Metro Phase 2B connecting to central Bangalore',
        'Suburban Ring Road (STRR) providing city connectivity',
        'Kempegowda International Airport expansion Phase 2',
      ],
      risks: [
        'Long commute to existing IT hubs',
        'Infrastructure timeline may slip by 1-2 years',
        'Speculative demand can be volatile',
      ],
      bestFor: 'Long-term investors, High risk tolerance',
      aiInsight: 'Devanahalli sits at the nexus of three mega-infrastructure projects. The BIAL IT Investment Region alone has potential to house 5 lakh+ jobs over 10 years. Entry prices at ₹3,800/sqft are the lowest in any growth micro-market in Bangalore. This is a classic early-mover play — high risk, but asymmetric upside.',
    },
    {
      rank: 2,
      areaId: 'hennur-road',
      areaName: 'Hennur Road',
      recommendationType: 'Buy Now',
      expectedROI: '25-35%',
      timeHorizon: '2-3 years',
      riskLevel: 'Low',
      currentPricePerSqft: 5900,
      targetPricePerSqft: 8000,
      confidence: 88,
      keyDrivers: [
        'Metro Phase 3 station confirmed on Hennur Road',
        'Manyata Tech Park 2km away — 80,000+ employees',
        'Affordable relative to Hebbal and Nagawara neighbors',
        'BBMP Master Plan 2031 allows high-density development',
      ],
      risks: [
        'Infrastructure still catching up',
        'Traffic on Hennur-Baglur Road',
      ],
      bestFor: 'First-time buyers, Mid-term investors',
      aiInsight: "Hennur Road is where Koramangala was in 2015 — pre-metro, pre-gentrification, with affordability still intact. The area benefits from direct spillover from Manyata Tech Park where rent-to-own ratios are making buyers of renters. The metro Phase 3 confirmation is the trigger event for re-rating.",
    },
    {
      rank: 3,
      areaId: 'sarjapur-road',
      areaName: 'Sarjapur Road',
      recommendationType: 'Buy Now',
      expectedROI: '20-28%',
      timeHorizon: '2-4 years',
      riskLevel: 'Low',
      currentPricePerSqft: 7200,
      targetPricePerSqft: 9500,
      confidence: 85,
      keyDrivers: [
        'Metro Phase 3 planning includes Sarjapur corridor',
        'RGA Tech Park, Wipro SEZ driving demand',
        'Multiple new residential launches by premium builders',
        'Kempegowda road widening improving access',
      ],
      risks: [
        'Current traffic congestion is severe',
        'Metro timeline uncertain beyond 2027',
      ],
      bestFor: 'IT professionals, Long-term investors',
      aiInsight: 'Sarjapur Road is the highest-velocity appreciation market in East Bangalore. Three consecutive years of 15%+ price growth reflects genuine demand from IT workers near RGA Tech Park and Wipro. Unlike speculative markets, rental yields here are strong at 3.8%, providing downside protection.',
    },
    {
      rank: 4,
      areaId: 'yelahanka',
      areaName: 'Yelahanka',
      recommendationType: 'Buy Now',
      expectedROI: '22-30%',
      timeHorizon: '2-4 years',
      riskLevel: 'Low',
      currentPricePerSqft: 6400,
      targetPricePerSqft: 8500,
      confidence: 86,
      keyDrivers: [
        'Airport proximity (15 mins to KIA)',
        'Metro Phase 3 Yelahanka station planned',
        'KIADB Aerospace SEZ nearby',
        'STRR passing through Yelahanka',
      ],
      risks: [
        'Limited direct IT park connectivity for now',
        'Dependent on infrastructure delivery timelines',
      ],
      bestFor: 'Airport professionals, Investors, End-users',
      aiInsight: "Yelahanka represents one of the best risk-reward propositions in Bangalore. It's affordable, connected (or will be via metro), and sits directly on the airport corridor. The STRR project is the game-changer — once operational, it will link Yelahanka to all of Bangalore's major hubs without going through the city center.",
    },
    {
      rank: 5,
      areaId: 'electronic-city',
      areaName: 'Electronic City',
      recommendationType: 'Watch & Buy',
      expectedROI: '18-25%',
      timeHorizon: '3-5 years',
      riskLevel: 'Low',
      currentPricePerSqft: 5800,
      targetPricePerSqft: 7800,
      confidence: 82,
      keyDrivers: [
        'Metro Phase 2 connectivity expected by 2027',
        'Home to India\'s largest IT cluster (Infosys, Wipro, TCS, HCL)',
        'Rental yield of 4.1% — best in Bangalore',
        'Hosur Road widening underway',
      ],
      risks: [
        'Traffic on Hosur Road remains severe till metro arrives',
        'Price already ran up significantly 2022-2024',
      ],
      bestFor: 'Income investors, IT workers',
      aiInsight: "Electronic City's investment case rests on one catalyst: the metro. When Phase 2 arrives in 2027, the 45-minute Hosur Road commute drops to 20 minutes. Prices in comparable markets have moved 20-30% within 12 months of metro opening. The 4.1% rental yield is the best in Bangalore, making this a productive hold.",
    },
  ],
};

// Call Gemini API for AI-powered analysis
export async function generateInvestmentReport(
  newsSignals: string[],
  areas: BangaloreArea[] = bangaloreAreas
): Promise<InvestmentReport> {
  if (!GEMINI_API_KEY) {
    // Return mock data if no API key
    return MOCK_INVESTMENT_REPORT;
  }

  const prompt = `You are an expert Bangalore real estate investment analyst. Based on the following news signals and area data, generate a comprehensive investment report.

NEWS SIGNALS:
${newsSignals.map((n, i) => `${i + 1}. ${n}`).join('\n')}

BANGALORE AREAS DATA:
${areas.slice(0, 10).map(a => `- ${a.name}: ₹${a.avgPricePerSqft}/sqft, ${a.oneYearChange}% 1Y growth, Score: ${a.investmentScore}`).join('\n')}

Generate a JSON investment report with:
1. marketSummary (2-3 paragraphs)
2. marketOutlook (Bullish/Neutral/Cautious)
3. top 5 investment opportunities with ranks, expectedROI, riskLevel, keyDrivers, aiInsight
4. topPick (area id)

Respond with valid JSON only.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    if (!response.ok) throw new Error('Gemini API error');

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const report = JSON.parse(jsonMatch[0]);
      return { ...report, generatedAt: new Date().toISOString() };
    }
  } catch (error) {
    console.error('Gemini API error, falling back to mock:', error);
  }

  return MOCK_INVESTMENT_REPORT;
}
