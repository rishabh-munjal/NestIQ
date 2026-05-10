'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, MapPin, Brain } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const trendData = [
  { m: 'Jan', v: 6200 }, { m: 'Feb', v: 6400 }, { m: 'Mar', v: 6100 },
  { m: 'Apr', v: 6800 }, { m: 'May', v: 7200 }, { m: 'Jun', v: 7000 },
  { m: 'Jul', v: 7600 }, { m: 'Aug', v: 7900 }, { m: 'Sep', v: 8100 },
  { m: 'Oct', v: 8400 }, { m: 'Nov', v: 8200 }, { m: 'Dec', v: 8700 },
];

const stats = [
  { label: 'Properties', value: 48000, suffix: '+', color: '#00063D' },
  { label: 'Localities',  value: 30,    suffix: '+', color: '#FA4028' },
  { label: 'Avg ROI',     value: 18,    suffix: '%', color: '#00063D' },
  { label: 'Sellers',     value: 12000, suffix: '+', color: '#FA4028' },
];

const features = [
  { href: '/explore',     title: 'Heat Map',      desc: 'Live price overlay across 30+ Bangalore localities.', tag: 'Live' },
  { href: '/invest',      title: 'AI Advisor',    desc: 'Gemini-ranked picks with ROI charts and radar analysis.', tag: 'AI' },
  { href: '/marketplace', title: 'Listings',      desc: 'Zero-brokerage. Price distribution chart. Direct contact.', tag: 'Free' },
  { href: '/formalities', title: 'Gov Wizard',    desc: 'Step-by-step RERA, Khata & stamp duty calculator.', tag: 'Guide' },
  { href: '/news',        title: 'Intelligence',  desc: 'Sentiment charts, area impact scores, topic heatmaps.', tag: 'Live' },
  { href: '/explore',     title: 'ROI Forecasts', desc: 'Infrastructure-linked price projections for 5-yr horizon.', tag: 'Data' },
];

const areas = [
  { name: 'Whitefield',      change: '+12%', hot: false },
  { name: 'Koramangala',     change: '+8%',  hot: false },
  { name: 'Sarjapur',        change: '+18%', hot: true },
  { name: 'Devanahalli',     change: '+25%', hot: true },
  { name: 'Yelahanka',       change: '+20%', hot: true },
  { name: 'Electronic City', change: '+15%', hot: false },
];

export default function HomePage() {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const [c0, c1, c2, c3] = [
    useCountUp(48000, 1600, vis), useCountUp(30, 1600, vis),
    useCountUp(18, 1600, vis),    useCountUp(12000, 1600, vis),
  ];
  const counts = [c0, c1, c2, c3];

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
        background: '#fff',
      }}>
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(0,6,61,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,6,61,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Accent blobs — Highlight colors */}
        <div style={{ position: 'absolute', top: '8%', right: '5%', width: 180, height: 180, background: '#FFF67D', opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '12%', left: '3%', width: 120, height: 120, background: '#E6FFD9', opacity: 0.7, pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, maxWidth: 1100, width: '100%', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Left copy */}
          <div>
            {/* New Research badge */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 10px', borderRadius: '4px', marginBottom: 28,
                background: '#E6FFD9',
                fontSize: 12, fontWeight: 500, color: '#103A00',
                fontFamily: "'DM Mono', monospace", letterSpacing: '-0.01em',
              }}>
              <span style={{ width: 6, height: 6, background: '#103A00', display: 'inline-block' }} className="pulse-dot" />
              AI-Powered · Bangalore Real Estate
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(36px, 4.5vw, 62px)',
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#00063D',
                marginBottom: 20,
              }}>
              Smarter Bangalore<br />
              <span style={{ color: '#FA4028' }}>Property Decisions</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              style={{ fontSize: 16, color: '#5E5D5F', lineHeight: 1.6, marginBottom: 32, maxWidth: 420, letterSpacing: '-0.01em' }}>
              Live heat maps, Gemini AI investment picks with visual ROI data, and a step-by-step gov guide — all for Bangalore.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 36, alignItems: 'center' }}>
              <Link href="/explore" style={{ textDecoration: 'none' }}>
                <button style={{ background: '#FA4028', color: '#fff', border: 'none', borderRadius: 0, padding: '14px 24px', fontSize: 15, fontWeight: 500, fontFamily: "'Inter', sans-serif", cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em' }}>
                  <MapPin size={15} /> Explore Map <ArrowRight size={14} />
                </button>
              </Link>
              <Link href="/invest" style={{ textDecoration: 'none' }}>
                <button style={{ background: 'transparent', color: '#00063D', border: 'none', borderRadius: 0, padding: '14px 0', fontSize: 15, fontWeight: 500, fontFamily: "'Inter', sans-serif", cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  <Brain size={15} /> AI Advisor
                </button>
              </Link>
            </motion.div>

            {/* Area pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {areas.map(a => (
                <span key={a.name} style={{
                  fontSize: 12, padding: '5px 10px',
                  border: '1px solid rgba(0,6,61,0.12)',
                  background: a.hot ? '#00063D' : '#F9F9F9',
                  color: a.hot ? '#fff' : '#5E5D5F',
                  display: 'flex', alignItems: 'center', gap: 5, fontWeight: 450,
                  fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em',
                }}>
                  {a.name}
                  <span style={{ color: a.hot ? '#FA4028' : '#103A00', fontWeight: 600 }}>{a.change}</span>
                  {a.hot && <span>🔥</span>}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — Price trend card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ background: '#F9F9F9', border: '1px solid rgba(0,6,61,0.10)', padding: 24 }}>
              {/* Flame top bar */}
              <div style={{ height: 3, background: '#FA4028', margin: '-24px -24px 20px' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p className="label" style={{ marginBottom: 4 }}>Bangalore Avg ₹/sqft</p>
                  <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 600, color: '#00063D', letterSpacing: '-0.02em', lineHeight: 1 }}>₹8,700</p>
                  <p style={{ fontSize: 12, color: '#103A00', marginTop: 6, fontWeight: 600 }}>↑ +40% over 3 years</p>
                </div>
                <div style={{ width: 44, height: 44, background: 'rgba(250,64,40,0.08)', border: '1px solid rgba(250,64,40,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  📈
                </div>
              </div>

              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FA4028" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FA4028" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,6,61,0.12)', borderRadius: 0, fontSize: 11, color: '#00063D' }}
                    formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, '₹/sqft']}
                    labelStyle={{ color: '#5E5D5F' }} itemStyle={{ color: '#FA4028', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#FA4028" strokeWidth={2.5} fill="url(#priceGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(0,6,61,0.08)' }}>
                <p className="label" style={{ marginBottom: 10 }}>Top AI Picks Right Now</p>
                {[
                  { area: 'Devanahalli', roi: '35–50%', conf: 95 },
                  { area: 'Hennur Road', roi: '28–40%', conf: 94 },
                  { area: 'Yelahanka',   roi: '25–35%', conf: 92 },
                ].map((p, i) => (
                  <div key={p.area} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#FA4028' : '#00063D', minWidth: 16, fontFamily: "'Playfair Display', Georgia, serif" }}>#{i+1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: '#00063D' }}>{p.area}</span>
                        <span style={{ color: '#103A00', fontWeight: 700 }}>{p.roi} ROI</span>
                      </div>
                      <div style={{ height: 3, background: '#EFEFEF' }}>
                        <div style={{ height: '100%', background: i === 0 ? '#FA4028' : '#00063D', width: `${p.conf}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? '#FA4028' : '#00063D' }}>{p.conf}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section ref={ref} style={{ borderTop: '1px solid rgba(0,6,61,0.10)', borderBottom: '1px solid rgba(0,6,61,0.10)', padding: '44px 24px', background: '#F9F9F9' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              style={{ textAlign: 'center', padding: '12px 8px', borderRight: i < 3 ? '1px solid rgba(0,6,61,0.10)' : 'none' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: s.color, marginBottom: 6, letterSpacing: '-0.02em' }}>
                {counts[i].toLocaleString('en-IN')}{s.suffix}
              </div>
              <div style={{ fontSize: 12, color: '#5E5D5F', fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1120, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 44 }}>
          <div className="label" style={{ marginBottom: 10 }}>Platform</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 600, color: '#00063D', letterSpacing: '-0.02em', marginBottom: 12 }}>Everything in one place</h2>
          <p style={{ fontSize: 16, color: '#5E5D5F', maxWidth: 420, lineHeight: 1.6, letterSpacing: '-0.01em' }}>
            From raw price data to AI-driven visual analytics — NestIQ gives Bangalore buyers an edge.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(0,6,61,0.08)' }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <Link href={f.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '28px 24px', background: '#F9F9F9',
                  cursor: 'pointer', transition: 'background 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#F9F9F9'; }}>
                  {/* Flame top accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: i === 0 || i === 4 ? '#FA4028' : '#00063D' }} />
                  {/* Tag badge */}
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', background: '#00063D', color: '#fff', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', display: 'inline-block', marginBottom: 16 }}>
                    {f.tag}
                  </span>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: '#00063D', marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#5E5D5F', lineHeight: 1.6, letterSpacing: '-0.01em' }}>{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI Signal Banner ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1120, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{
            background: '#F9F9F9',
            border: '1px solid rgba(0,6,61,0.10)',
            padding: '34px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
            position: 'relative', overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#FA4028' }} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="label" style={{ marginBottom: 10 }}>AI Market Signal</div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 600, color: '#00063D', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Top pick: <span style={{ color: '#FA4028' }}>Devanahalli</span>
            </h3>
            <p style={{ fontSize: 14, color: '#5E5D5F', lineHeight: 1.6, marginBottom: 16, maxWidth: 440, letterSpacing: '-0.01em' }}>
              BIAL IT Investment Region, STRR highway & Airport Metro Phase 2B. Entry at ₹3,800/sqft with 35–50% ROI in 3–5 years.
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['₹3,800/sqft', '35–50% ROI', '3–5 yr horizon', '95% confidence'].map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: '4px 8px', background: '#00063D', color: '#fff', fontFamily: "'DM Mono', monospace", letterSpacing: '0.02em' }}>{t}</span>
              ))}
            </div>
          </div>
          <Link href="/invest" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'transparent', color: '#00063D', border: '1px solid rgba(0,6,61,0.22)', borderRadius: 0, padding: '12px 20px', fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              Full AI Report <ArrowRight size={14} />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0,6,61,0.10)', padding: '24px', background: '#F9F9F9' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, background: '#00063D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif" }}>N</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, fontWeight: 600, color: '#00063D', letterSpacing: '-0.01em' }}>NestIQ</span>
            <span style={{ fontSize: 12, color: '#5E5D5F' }}>— Bangalore Smart Real Estate</span>
          </div>
          <span style={{ fontSize: 12, color: '#5E5D5F', fontFamily: "'DM Mono', monospace" }}>Educational purposes · Always verify independently</span>
        </div>
      </footer>
    </div>
  );
}
