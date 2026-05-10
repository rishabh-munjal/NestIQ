'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  ScatterChart, Scatter
} from 'recharts';
import { Brain, Zap, RefreshCw, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import type { InvestmentReport, InvestmentOpportunity } from '@/lib/ai/investmentAdvisor';
import { MOCK_NEWS_FEED } from '@/lib/scraper/anakin';

// ─── Custom Tooltip ───────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 0, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--muted2)', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color || 'var(--text)', fontWeight: 600 }}>{p.name}: {p.value}{p.unit || ''}</p>
      ))}
    </div>
  );
}

// ─── ROI Comparison Chart ─────────────────────────────────────
function ROIChart({ opportunities }: { opportunities: InvestmentOpportunity[] }) {
  const data = opportunities.map(o => ({
    name: o.areaName.replace(' Road', '').replace(' Layout', ''),
    roi: parseFloat(o.expectedROI.replace(/[^0-9.]/g, '')),
    confidence: o.confidence,
    color: o.rank === 1 ? '#FA4028' : o.rank <= 2 ? '#00063D' : o.rank <= 3 ? '#103A00' : '#5E5D5F',
  }));

  return (
    <div className="card" style={{ padding: '20px 20px 14px' }}>
      <p className="label" style={{ marginBottom: 14 }}>Expected ROI Comparison</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ bottom: 0, left: -15 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted2)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--muted2)' }} unit="%" />
          <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="roi" name="ROI" radius={[0, 0, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Radar Chart (Area Factors) ───────────────────────────────
function AreaRadar({ opp }: { opp: InvestmentOpportunity }) {
  const data = [
    { subject: 'ROI',         A: parseFloat(opp.expectedROI.replace(/[^0-9.]/g, '')) },
    { subject: 'Confidence',  A: opp.confidence },
    { subject: 'Price Value', A: opp.currentPricePerSqft > 5000 ? 60 : 85 },
    { subject: 'Momentum',    A: Math.min((opp.targetPricePerSqft - opp.currentPricePerSqft) / opp.currentPricePerSqft * 100, 100) },
    { subject: 'Safety',      A: opp.riskLevel === 'Low' ? 90 : opp.riskLevel === 'Medium' ? 65 : 40 },
  ];

  return (
    <ResponsiveContainer width="100%" height={170}>
      <RadarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted2)' }} />
        <Radar dataKey="A" stroke="#FA4028" fill="#FA4028" fillOpacity={0.12} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Opportunity Card ─────────────────────────────────────────
function OppCard({ opp, rank }: { opp: InvestmentOpportunity; rank: number }) {
  const [open, setOpen] = useState(rank === 1);
  const isTop = rank === 1;
  const roiNum = parseFloat(opp.expectedROI.replace(/[^0-9.]/g, ''));
  const priceUpside = Math.round(((opp.targetPricePerSqft - opp.currentPricePerSqft) / opp.currentPricePerSqft) * 100);

  const rankColors = ['#FA4028', '#00063D', '#103A00', '#0095FF', '#5E5D5F'];
  const rc = rankColors[rank - 1] || '#5E5D5F';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.07 }}
      className="card"
      style={{ overflow: 'hidden', borderColor: isTop ? 'rgba(250,64,40,0.3)' : 'var(--border)' }}
    >
      {/* rank stripe */}
      <div style={{ height: 3, background: rc }} />

      <div style={{ padding: '16px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 0, flexShrink: 0,
              background: `${rc}18`, border: `1px solid ${rc}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 15, color: rc,
            }}>#{rank}</div>
            <div>
              <h3 className="heading" style={{ fontSize: 16 }}>{opp.areaName}</h3>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{opp.bestFor}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge ${opp.recommendationType === 'Buy Now' ? 'badge-green' : opp.recommendationType === 'Watch & Buy' ? 'badge-amber' : opp.recommendationType === 'Premium Buy' ? 'badge-violet' : 'badge-muted'}`}>
              {opp.recommendationType}
            </span>
            <span className={`risk-${opp.riskLevel.toLowerCase()}`}>{opp.riskLevel} Risk</span>
          </div>
        </div>

        {/* Metric mini-cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'ROI',     value: opp.expectedROI, color: 'var(--green)' },
            { label: 'Upside',  value: `+${priceUpside}%`, color: 'var(--lime)' },
            { label: 'Entry',   value: `₹${(opp.currentPricePerSqft/1000).toFixed(1)}K`, color: 'var(--cyan)' },
            { label: 'Horizon', value: opp.timeHorizon, color: 'var(--amber)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--surface2)', borderRadius: 0, padding: '10px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{m.label}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: m.color, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Confidence bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
            <span style={{ color: 'var(--muted)' }}>AI Confidence</span>
            <span style={{ color: rc, fontWeight: 700 }}>{opp.confidence}%</span>
          </div>
          <div className="progress-track">
            <motion.div className="progress-bar" style={{ background: rc }}
              initial={{ width: 0 }} animate={{ width: `${opp.confidence}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setOpen(!open)} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 500, color: 'var(--muted2)', padding: 0,
        }}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {open ? 'Less' : 'Deep Analysis'}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)', marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* AI insight */}
                  <div style={{ padding: '12px 14px', borderRadius: 0, background: 'var(--violet-d)', border: '1px solid var(--border)' }}>
                    <p className="label" style={{ color: 'var(--color-jasper-indigo)', marginBottom: 8 }}>Gemini Insight</p>
                    <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.65 }}>{opp.aiInsight}</p>
                  </div>

                  {/* Drivers vs risks */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <p className="label" style={{ color: 'var(--green)', marginBottom: 8 }}>+ Key Drivers</p>
                      {opp.keyDrivers.map(d => (
                        <p key={d} style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 5, lineHeight: 1.5, display: 'flex', gap: 6 }}>
                          <span style={{ color: 'var(--green)', flexShrink: 0 }}>→</span>{d}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="label" style={{ color: 'var(--rose)', marginBottom: 8 }}>! Risks</p>
                      {opp.risks.map(r => (
                        <p key={r} style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 5, lineHeight: 1.5, display: 'flex', gap: 6 }}>
                          <span style={{ color: 'var(--amber)', flexShrink: 0 }}>⚠</span>{r}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Price target */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 0, background: 'var(--surface2)' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Price Target</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      ₹{opp.currentPricePerSqft.toLocaleString()} → ₹{opp.targetPricePerSqft.toLocaleString()}/sqft
                    </span>
                  </div>
                </div>

                {/* Radar */}
                <div>
                  <p className="label" style={{ marginBottom: 4, textAlign: 'center' }}>Factor Analysis</p>
                  <AreaRadar opp={opp} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Signals Tab ──────────────────────────────────────────────
function SignalsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {MOCK_NEWS_FEED.map((n, i) => (
        <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
          className="card" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Impact orb */}
            <div style={{
              width: 36, height: 36, borderRadius: 0, flexShrink: 0,
              background: n.impactScore >= 85 ? 'var(--green-d)' : n.impactScore >= 70 ? 'var(--violet-d)' : 'var(--amber-d)',
              border: `1px solid var(--border)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
              color: n.impactScore >= 85 ? 'var(--green)' : n.impactScore >= 70 ? 'var(--color-jasper-indigo)' : 'var(--amber)',
            }}>{n.impactScore}</div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{n.title}</span>
                <span className={`badge ${n.sentiment === 'Bullish' ? 'badge-green' : n.sentiment === 'Bearish' ? 'badge-red' : 'badge-amber'}`} style={{ flexShrink: 0, fontSize: 10 }}>
                  {n.sentiment}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {n.affectedAreas.slice(0, 3).map(a => (
                  <span key={a} className="badge badge-cyan" style={{ fontSize: 10 }}>📍 {a}</span>
                ))}
                {n.tags.slice(0, 2).map(t => (
                  <span key={t} className="badge badge-muted" style={{ fontSize: 10 }}>#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function InvestPage() {
  const [report,  setReport]  = useState<InvestmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [tab,     setTab]     = useState<'picks' | 'signals' | 'chart'>('picks');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/ai-invest');
      setReport(await r.json());
    } catch {
      const { MOCK_INVESTMENT_REPORT } = await import('@/lib/ai/investmentAdvisor');
      setReport(MOCK_INVESTMENT_REPORT);
    } finally { setLoading(false); }
  }

  async function ask() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/ai-invest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      setReport(await r.json());
    } catch {
      const { MOCK_INVESTMENT_REPORT } = await import('@/lib/ai/investmentAdvisor');
      setReport(MOCK_INVESTMENT_REPORT);
    } finally { setLoading(false); }
  }

  const outlookColor = report?.marketOutlook === 'Bullish' ? 'var(--green)' : report?.marketOutlook === 'Cautious' ? 'var(--rose)' : 'var(--amber)';

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="label" style={{ marginBottom: 6 }}>Powered by Gemini 2.0 Flash</div>
          <h1 className="heading" style={{ fontSize: 26, marginBottom: 8 }}>AI Investment Advisor</h1>
          
          {/* Query bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" style={{ flex: 1 }}
              placeholder="Ask: 'Best area for ₹50L?' · 'Impact of metro Phase 3?'"
              value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} />
            <button className="btn btn-primary" onClick={ask} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
              <Zap size={14} /> Analyze
            </button>
            <button className="btn btn-secondary" onClick={load} disabled={loading} style={{ padding: '10px 14px' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Market overview KPIs */}
        {!loading && report && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            <div className="kpi-chip" style={{ borderColor: `${outlookColor}25` }}>
              <p className="label" style={{ marginBottom: 6 }}>Market Outlook</p>
              <p className="kpi-value" style={{ color: outlookColor, marginBottom: 4 }}>{report.marketOutlook}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{report.marketSummary.slice(0, 80)}…</p>
            </div>
            <div className="kpi-chip">
              <p className="label" style={{ marginBottom: 6 }}>Top Pick ROI</p>
              <p className="kpi-value" style={{ color: 'var(--lime)', marginBottom: 4 }}>{report.opportunities?.[0]?.expectedROI}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{report.opportunities?.[0]?.areaName} · {report.opportunities?.[0]?.timeHorizon}</p>
            </div>
            <div className="kpi-chip">
              <p className="label" style={{ marginBottom: 6 }}>Generated</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{new Date(report.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(report.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'picks',   label: 'Investment Picks' },
            { key: 'chart',   label: 'ROI Chart' },
            { key: 'signals', label: 'Market Signals' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 18px', fontSize: 13, fontWeight: 500,
              color: tab === t.key ? 'var(--color-jasper-indigo)' : 'var(--muted)',
              borderBottom: tab === t.key ? '2px solid var(--color-jasper-flame)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '64px 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} style={{ width: 8, height: 8, borderRadius: 0, background: 'var(--color-jasper-indigo)' }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted2)' }}>Gemini AI analyzing Bangalore market…</p>
            </motion.div>

          ) : tab === 'picks' && report ? (
            <motion.div key="picks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {report.opportunities?.map((opp, i) => <OppCard key={opp.areaId} opp={opp} rank={opp.rank} />)}
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 24 }}>
                For informational purposes only · Always verify independently
              </p>
            </motion.div>

          ) : tab === 'chart' && report ? (
            <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ROIChart opportunities={report.opportunities || []} />
              
              {/* Price entry vs target scatter-like comparison */}
              <div className="card" style={{ padding: '20px', marginTop: 14 }}>
                <p className="label" style={{ marginBottom: 16 }}>Entry Price vs Target Price (₹/sqft)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {report.opportunities?.map((opp, i) => {
                    const rc = ['#FA4028','#00063D','#103A00','#0095FF','#5E5D5F'][i] || '#5E5D5F';
                    const maxP = 20000;
                    return (
                      <div key={opp.areaId}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: 'var(--muted2)', fontWeight: 500 }}>{opp.areaName}</span>
                          <span style={{ color: rc, fontWeight: 700 }}>₹{opp.currentPricePerSqft.toLocaleString()} → ₹{opp.targetPricePerSqft.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 10, borderRadius: 0, background: 'var(--surface3)', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 0, background: `${rc}40`, width: `${(opp.currentPricePerSqft / maxP) * 100}%` }} />
                          <motion.div
                            initial={{ width: `${(opp.currentPricePerSqft / maxP) * 100}%` }}
                            animate={{ width: `${(opp.targetPricePerSqft / maxP) * 100}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: i * 0.1 }}
                            style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 0, background: rc }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* News signals in chart view */}
              {report.newsSignals?.length > 0 && (
                <div className="card" style={{ padding: '16px 20px', marginTop: 14 }}>
                  <p className="label" style={{ marginBottom: 12 }}>News Signals Feeding This Report</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {report.newsSignals.map(s => (
                      <span key={s} className="badge badge-violet">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

          ) : tab === 'signals' ? (
            <motion.div key="signals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SignalsTab />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
