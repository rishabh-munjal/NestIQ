'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadialBarChart, RadialBar, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie
} from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import type { NewsItem } from '@/lib/scraper/anakin';

// ─── Custom Tooltip ───────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 0, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--muted2)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--text)', fontWeight: 600 }}>{payload[0].name}: <span style={{ color: 'var(--color-jasper-flame)' }}>{payload[0].value}</span></p>
    </div>
  );
}

// ─── Sentiment Donut ──────────────────────────────────────────
function SentimentDonut({ bullish, neutral, bearish }: { bullish: number; neutral: number; bearish: number }) {
  const total = bullish + neutral + bearish;
  const data = [
    { name: 'Bullish', value: bullish, color: '#34d399' },
    { name: 'Neutral', value: neutral, color: '#fbbf24' },
    { name: 'Bearish', value: bearish, color: '#fb7185' },
  ];
  const bullPct = total > 0 ? Math.round((bullish / total) * 100) : 0;

  return (
    <div className="kpi-chip" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={45} dataKey="value" strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#103A00', fontFamily: "'Playfair Display', Georgia, serif" }}>{bullPct}%</span>
          <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 500 }}>BULL</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <p className="label" style={{ marginBottom: 10 }}>Sentiment Mix</p>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--muted2)', flex: 1 }}>{d.name}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Area Impact Chart ────────────────────────────────────────
function AreaImpactChart({ news }: { news: NewsItem[] }) {
  // Aggregate impact score by area
  const areaMap: Record<string, { total: number; count: number }> = {};
  news.forEach(n => {
    n.affectedAreas.forEach(a => {
      if (!areaMap[a]) areaMap[a] = { total: 0, count: 0 };
      areaMap[a].total += n.impactScore;
      areaMap[a].count += 1;
    });
  });
  const data = Object.entries(areaMap)
    .map(([name, { total, count }]) => ({ name, score: Math.round(total / count) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <div className="kpi-chip" style={{ paddingBottom: 12 }}>
      <p className="label" style={{ marginBottom: 14 }}>Area Impact Scores</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: -10, right: 10 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="score" name="Impact" radius={[0, 5, 5, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#FA4028' : i === 1 ? '#00063D' : i < 4 ? '#103A00' : '#5E5D5F'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Tag Cloud ────────────────────────────────────────────────
function TopTags({ news }: { news: NewsItem[] }) {
  const tagMap: Record<string, number> = {};
  news.forEach(n => n.tags.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const tags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const max = tags[0]?.[1] || 1;

  return (
    <div className="kpi-chip">
      <p className="label" style={{ marginBottom: 12 }}>Hot Topics</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {tags.map(([tag, count]) => {
          const intensity = count / max;
          return (
            <span key={tag} style={{
              fontSize: 11 + Math.round(intensity * 3),
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 20,
              background: `rgba(0,6,61,${0.06 + intensity * 0.18})`,
              color: intensity > 0.6 ? 'var(--color-jasper-indigo)' : 'var(--color-graphite)',
              border: `1px solid rgba(0,6,61,${0.08 + intensity * 0.22})`,
              cursor: 'default',
            }}>
              #{tag} <span style={{ opacity: 0.6, fontSize: 10 }}>×{count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── News Card (compact visual) ───────────────────────────────
function NewsCard({ item, i }: { item: NewsItem; i: number }) {
  const sentimentConfig = {
    Bullish: { color: 'var(--green)',  bg: 'var(--green-d)',  icon: <TrendingUp size={11} /> },
    Bearish: { color: 'var(--rose)',   bg: 'var(--rose-d)',   icon: <TrendingDown size={11} /> },
    Neutral: { color: 'var(--amber)',  bg: 'var(--amber-d)',  icon: <Minus size={11} /> },
  };
  const s = sentimentConfig[item.sentiment as keyof typeof sentimentConfig] || sentimentConfig.Neutral;
  const impactColor = item.impactScore >= 85 ? 'var(--green)' : item.impactScore >= 70 ? 'var(--violet)' : 'var(--amber)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className="card card-hover"
      style={{ padding: '14px 18px', cursor: 'pointer' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, flex: 1 }}>{item.title}</h3>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
          background: s.bg, color: s.color, flexShrink: 0,
        }}>
          {s.icon} {item.sentiment}
        </span>
      </div>

      {/* Impact bar + score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 40 }}>Impact</span>
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--surface3)' }}>
          <div style={{ height: '100%', borderRadius: 4, background: impactColor, width: `${item.impactScore}%`, transition: 'width 0.6s ease' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: impactColor, minWidth: 22 }}>{item.impactScore}</span>
      </div>

      {/* Areas + source */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {item.affectedAreas.slice(0, 3).map(a => (
            <span key={a} className="badge badge-cyan" style={{ fontSize: 10 }}>📍 {a}</span>
          ))}
        </div>
        <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>{item.source}</span>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function NewsPage() {
  const [news,      setNews]       = useState<NewsItem[]>([]);
  const [loading,   setLoading]    = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [filter,    setFilter]     = useState<'All' | 'Bullish' | 'Neutral' | 'Bearish'>('All');
  const [liveSource,setLiveSource] = useState(false);

  const load = useCallback(async (bust = false) => {
    try {
      const r = await fetch('/api/news', bust ? { method: 'POST' } : {});
      const d = await r.json();
      const items = (d.news || []) as NewsItem[];
      if (items.length > 0) {
        setNews(items);
        setLiveSource(d.source === 'live');
      } else {
        // fallback to curated mock data so UI is always populated
        const { MOCK_NEWS_FEED } = await import('@/lib/scraper/anakin');
        setNews(MOCK_NEWS_FEED);
        setLiveSource(false);
      }
    } catch {
      const { MOCK_NEWS_FEED } = await import('@/lib/scraper/anakin');
      setNews(MOCK_NEWS_FEED);
    }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const filtered = filter === 'All' ? news : news.filter(n => n.sentiment === filter);
  const bullish  = news.filter(n => n.sentiment === 'Bullish').length;
  const neutral  = news.filter(n => n.sentiment === 'Neutral').length;
  const bearish  = news.filter(n => n.sentiment === 'Bearish').length;
  const avgImpact = news.length ? Math.round(news.reduce((s, n) => s + n.impactScore, 0) / news.length) : 0;
  const topArea  = (() => {
    const m: Record<string, number> = {};
    news.forEach(n => n.affectedAreas.forEach(a => { m[a] = (m[a] || 0) + 1; }));
    return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();

  const marketMood = bullish > bearish + neutral ? 'Bullish' : bearish > bullish + neutral ? 'Bearish' : 'Neutral';
  const moodColor  = marketMood === 'Bullish' ? 'var(--green)' : marketMood === 'Bearish' ? 'var(--rose)' : 'var(--amber)';

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: 1120, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Anakin.io × Gemini AI</div>
            <h1 className="heading" style={{ fontSize: 26, marginBottom: 4 }}>Market Intelligence</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted2)' }}>
              <span>{news.length} signals tracked</span>
              {liveSource && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--cyan)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-jasper-flame)', display: 'inline-block' }} className="pulse-dot" />
                  Live scraped
                </span>
              )}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={refresh} disabled={refreshing} style={{ fontSize: 13 }}>
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Scraping…' : 'Live Refresh'}
          </button>
        </div>

        {/* ── KPI Row ── */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Market Mood',   value: marketMood,        sub: 'AI composite',      color: moodColor },
              { label: 'Avg Impact',    value: avgImpact,         sub: 'Out of 100',        color: avgImpact >= 80 ? 'var(--green)' : avgImpact >= 65 ? 'var(--color-jasper-indigo)' : 'var(--amber)' },
              { label: 'Top Area',      value: topArea,           sub: 'Most mentioned',    color: 'var(--color-jasper-flame)' },
              { label: 'Bullish Ratio', value: `${bullish}:${bearish}`, sub: 'Bull vs Bear', color: bullish > bearish ? 'var(--green)' : 'var(--rose)' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="kpi-chip">
                <p className="label" style={{ marginBottom: 8 }}>{k.label}</p>
                <p className="kpi-value" style={{ color: k.color, fontSize: 22, marginBottom: 4 }}>{k.value}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{k.sub}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Charts row ── */}
        {!loading && news.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 14, marginBottom: 28 }}>
            <SentimentDonut bullish={bullish} neutral={neutral} bearish={bearish} />
            <AreaImpactChart news={news} />
            <TopTags news={news} />
          </div>
        )}

        {/* ── Filter pills ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['All', 'Bullish', 'Neutral', 'Bearish'] as const).map(f => {
            const colors: Record<string, string> = { All: 'var(--color-jasper-indigo)', Bullish: 'var(--green)', Neutral: 'var(--amber)', Bearish: 'var(--rose)' };
            const isActive = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 16px', borderRadius: 0, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: isActive ? colors[f] : 'var(--surface2)',
                color: isActive ? (f === 'Neutral' ? '#111' : '#fff') : 'var(--muted2)',
              }}>
                {f} {f !== 'All' && `(${f === 'Bullish' ? bullish : f === 'Neutral' ? neutral : bearish})`}
              </button>
            );
          })}
        </div>

        {/* ── Feed ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shimmer" style={{ height: 88, borderRadius: 0, marginBottom: 8 }} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {filtered.map((item, i) => <NewsCard key={item.id} item={item} i={i} />)}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
                  No signals for this filter
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 28 }}>
          Scraped by Anakin.io · Analyzed by Gemini AI · Bangalore real estate intelligence
        </p>
      </div>
    </div>
  );
}
