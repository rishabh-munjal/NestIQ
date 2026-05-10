'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { govSteps, calculateStampDuty } from '@/lib/data/govProcesses';
import { CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

// ── Stamp Duty Calculator ────────────────────────────────────
function StampDutyCalc() {
  const [value,    setValue]    = useState('');
  const [female,   setFemale]   = useState(false);
  const [result,   setResult]   = useState<ReturnType<typeof calculateStampDuty> | null>(null);

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr`
    : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L`
    : `₹${n.toLocaleString('en-IN')}`;

  const calc = () => {
    const v = parseInt(value.replace(/,/g, ''));
    if (v > 0) setResult(calculateStampDuty(v, female));
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="label" style={{ marginBottom: 14 }}>Stamp Duty Calculator</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <input className="input" placeholder="Property value (₹)" type="number" value={value} onChange={e => setValue(e.target.value)} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--muted2)' }}>
          <input type="checkbox" checked={female} onChange={e => setFemale(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: 'var(--color-jasper-flame)' }} />
          Female buyer (1% concession)
        </label>

        <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={calc}>
          Calculate
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              {result.breakdown.map(({ label, amount }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--muted2)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-jasper-indigo)' }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-jasper-indigo)', fontFamily: "'Playfair Display', Georgia, serif" }}>{fmt(result.total)}</span>
              </div>
              {female && (
                <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 8 }}>
                  ✓ Female concession applied — saving ~{fmt(Math.round(result.guidanceValue * 0.01))}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Step Item ────────────────────────────────────────────────
function StepItem({ step, index, completed, active, onToggle, onComplete }: {
  step: typeof govSteps[number];
  index: number;
  completed: boolean;
  active: boolean;
  onToggle: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="card" style={{
      overflow: 'hidden',
      borderColor: completed ? 'rgba(34,197,94,0.2)' : active ? 'rgba(45,212,191,0.18)' : 'var(--border)',
    }}>
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          width: '100%', padding: '16px 18px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Step marker / check */}
        <button
          onClick={e => { e.stopPropagation(); onComplete(); }}
          style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
            border: `1px solid ${completed ? 'rgba(34,197,94,0.4)' : 'var(--border2)'}`,
            background: completed ? 'rgba(34,197,94,0.1)' : 'var(--surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          title={completed ? 'Undo' : 'Mark complete'}
        >
          {completed
            ? <CheckCircle2 size={15} style={{ color: 'var(--green)' }} />
            : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted2)', fontFamily: "'DM Mono', monospace" }}>{index + 1}</span>
          }
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15 }}>{step.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: completed ? 'var(--green)' : 'var(--text)' }}>{step.title}</span>
            {step.isOnline && <span className="badge badge-cyan" style={{ fontSize: 9 }}>Online</span>}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{step.subtitle}</p>
        </div>

        <div style={{ flexShrink: 0, textAlign: 'right', marginRight: 8 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{step.duration}</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)' }}>{step.cost}</p>
        </div>

        {active ? <ChevronUp size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                : <ChevronDown size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />}
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--border)' }}>
              <div style={{ paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Meta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Department', value: step.department },
                    { label: 'Duration',   value: step.duration },
                    { label: 'Cost',       value: step.cost },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '10px 12px', borderRadius: 0, background: 'var(--surface2)' }}>
                      <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{m.label}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <div>
                  <div className="label" style={{ marginBottom: 10 }}>Documents Required</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {step.documents.map(d => (
                      <li key={d} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--amber)', flexShrink: 0 }}>□</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div style={{ padding: '12px 14px', borderRadius: 0, background: 'var(--violet-d)', border: '1px solid var(--border)' }}>
                  <div className="label" style={{ marginBottom: 8, color: 'var(--color-jasper-indigo)' }}>Pro Tips</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {step.tips.map(t => (
                      <li key={t} style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.55 }}>💡 {t}</li>
                    ))}
                  </ul>
                </div>

                {/* Warnings */}
                {step.warnings?.length > 0 && (
                  <div style={{ padding: '12px 14px', borderRadius: 0, background: 'var(--rose-d)', border: '1px solid rgba(250,117,96,0.15)' }}>
                    <div className="label" style={{ marginBottom: 8, color: 'var(--color-system-red)' }}>Watch Out</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {step.warnings.map(w => (
                        <li key={w} style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.55 }}>⚠ {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Portal link */}
                {step.officialPortal && (
                  <a href={step.officialPortal} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--color-jasper-indigo)', textDecoration: 'none' }}>
                    <ExternalLink size={13} />
                    Open {step.portalLabel}
                  </a>
                )}

                <button
                  onClick={onComplete}
                  className={`btn ${completed ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {completed ? '✓ Marked Complete · Click to undo' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────
export default function FormalitiesPage() {
  const [active,    setActive]    = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggle = (i: number) => setActive(active === i ? -1 : i);
  const markComplete = (i: number) => setCompleted(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const pct = Math.round((completed.size / govSteps.length) * 100);

  return (
    <div className="page-shell">
      <div className="container" style={{ padding: '40px 24px', maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="label" style={{ marginBottom: 8 }}>Karnataka · Bangalore</div>
          <h1 className="heading" style={{ fontSize: 26, marginBottom: 8 }}>Government Formality Guide</h1>
          <p style={{ fontSize: 14, color: 'var(--muted2)', marginBottom: 20 }}>
            Complete 7-step property buying process — RERA, Khata, stamp duty, sale deed.
          </p>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="progress-track" style={{ flex: 1 }}>
              <motion.div className="progress-bar" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted2)', minWidth: 50 }}>
              {completed.size}/{govSteps.length} done
            </span>
          </div>
          {completed.size === govSteps.length && (
            <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>🎉 All steps complete!</p>
          )}
        </div>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {govSteps.map((step, i) => (
              <motion.div key={step.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <StepItem
                  step={step} index={i}
                  completed={completed.has(i)}
                  active={active === i}
                  onToggle={() => toggle(i)}
                  onComplete={() => markComplete(i)}
                />
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 76, alignSelf: 'start' }}>
            <StampDutyCalc />

            {/* Quick links */}
            <div className="card" style={{ padding: 18 }}>
              <div className="label" style={{ marginBottom: 12 }}>Quick Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { label: 'K-RERA Portal',    url: 'https://rera.karnataka.gov.in',  desc: 'Verify RERA registration' },
                  { label: 'Kaveri Online',     url: 'https://kaveri.karnataka.gov.in', desc: 'EC & registration' },
                  { label: 'BBMP Citizen',      url: 'https://bbmpcitizen.in',         desc: 'Khata services' },
                  { label: 'IGR Karnataka',     url: 'https://igr.karnataka.gov.in',   desc: 'Stamp duty payment' },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '9px 12px', borderRadius: 0, textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
                  >
                    <ExternalLink size={11} style={{ color: 'var(--color-jasper-flame)', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{link.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{link.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="card" style={{ padding: 18, borderColor: 'rgba(167,139,250,0.15)' }}>
              <div className="label" style={{ marginBottom: 8 }}>Lawyer Tip</div>
              <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.65 }}>
                For any property above ₹30 lakhs, spending ₹10,000–15,000 on a property lawyer for title verification is the best insurance you can buy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .grid-cols-sidebar { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
