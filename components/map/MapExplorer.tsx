'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { bangaloreAreas, BangaloreArea, getPriceColor, getInvestmentScoreColor } from '@/lib/data/bangaloreAreas';
import { TrendingUp, TrendingDown, MapPin, X, Building2, Wifi, Star, DollarSign, Home, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ─── Score Bar ─────────────────────────────────────────── */
function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 5, background: 'var(--surface3)', overflow: 'hidden' }}>
        <motion.div style={{ height: '100%', borderRadius: 5, background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 24 }}>{value}</span>
    </div>
  );
}

/* ─── Area Detail Panel ─────────────────────────────────── */
function AreaPanel({ area, onClose }: { area: BangaloreArea; onClose: () => void }) {
  const isUp = area.oneYearChange > 0;
  const scoreColor = getInvestmentScoreColor(area.investmentScore);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 380,
        zIndex: 1000, overflowY: 'auto',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.1)',
      }}
    >
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '14px 18px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 className="heading" style={{ fontSize: 17 }}>{area.name}</h2>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{area.zone} Bangalore · {area.tier}</p>
        </div>
        <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', padding: '5px 7px', display: 'flex' }}>
          <X size={15} />
        </button>
      </div>

      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Price hero */}
        <div style={{ padding: 16, borderRadius: 14, background: 'var(--violet-d)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontWeight: 500 }}>AVG PRICE PER SQFT</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <span className="heading" style={{ fontSize: 30 }}>₹{area.avgPricePerSqft.toLocaleString('en-IN')}</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: isUp ? 'var(--green-d)' : 'var(--rose-d)',
              color: isUp ? 'var(--green)' : 'var(--rose)',
            }}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : ''}{area.oneYearChange}% YoY
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>3-yr appreciation: +{area.threeYearChange}%</p>
        </div>

        {/* Quick metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Rental Yield', value: `${area.rentalYield}%`, color: 'var(--green)', icon: DollarSign },
            { label: 'Avg Rent 2BHK', value: `₹${(area.avgRentPerMonth/1000).toFixed(0)}K/mo`, color: 'var(--cyan)', icon: Home },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <Icon size={13} style={{ color, marginBottom: 6 }} />
              <div className="heading" style={{ fontSize: 17, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Investment score */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Investment Score</span>
            <span className="heading" style={{ fontSize: 22, color: scoreColor }}>{area.investmentScore}/100</span>
          </div>
          {[
            { label: 'Infrastructure', value: area.infrastructure, color: 'var(--violet)' },
            { label: 'Liveability',   value: area.liveability,   color: 'var(--green)' },
            { label: 'Connectivity',  value: area.connectivity,  color: 'var(--cyan)' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                <span>{s.label}</span><span style={{ fontWeight: 600 }}>{s.value}%</span>
              </div>
              <ScoreBar value={s.value} color={s.color} />
            </div>
          ))}
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.65 }}>{area.description}</p>

        {/* IT Hubs & Metro */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Building2 size={12} style={{ color: 'var(--violet)' }} />
              <span className="label">Nearby IT Hubs</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {area.nearbyIT.map(it => <span key={it} className="badge badge-violet" style={{ fontSize: 10 }}>{it}</span>)}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Wifi size={12} style={{ color: 'var(--cyan)' }} />
              <span className="label">Metro Stations</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {area.nearbyMetro.map(m => <span key={m} className="badge badge-cyan" style={{ fontSize: 10 }}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div className="label" style={{ color: 'var(--green)', marginBottom: 8 }}>✓ Pros</div>
            {area.pros.slice(0, 3).map(p => (
              <p key={p} style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 5, lineHeight: 1.5, display: 'flex', gap: 5 }}>
                <span style={{ color: 'var(--green)', flexShrink: 0 }}>→</span>{p}
              </p>
            ))}
          </div>
          <div>
            <div className="label" style={{ color: 'var(--rose)', marginBottom: 8 }}>! Cons</div>
            {area.cons.slice(0, 3).map(c => (
              <p key={c} style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 5, lineHeight: 1.5, display: 'flex', gap: 5 }}>
                <span style={{ color: 'var(--amber)', flexShrink: 0 }}>⚠</span>{c}
              </p>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
          <Link href={`/marketplace?area=${area.id}`} style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Home size={14} /> View Properties
            </button>
          </Link>
          <Link href="/invest" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Star size={14} /> AI Analysis
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Map Explorer ─────────────────────────────────── */
interface FilterState { tier: string; zone: string; minScore: number; }

export default function MapExplorer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<any>(null);   // leaflet Map instance
  const markersRef      = useRef<any>(null);   // layerGroup for markers
  const [selectedArea, setSelectedArea] = useState<BangaloreArea | null>(null);
  const [filters,      setFilters]      = useState<FilterState>({ tier: 'All', zone: 'All', minScore: 0 });
  const [mapReady,     setMapReady]     = useState(false);
  const [showLegend,   setShowLegend]   = useState(true);

  /* ── Init Leaflet (once) ────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapRef.current) return; // already initialised
    if (!mapContainerRef.current) return;

    let cancelled = false;

    import('leaflet').then(mod => {
      if (cancelled || !mapContainerRef.current) return;
      const L = mod.default;

      // suppress default icon path bug
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11,
        zoomControl: true,
        attributionControl: true,
      });

      // Light Carto tile for light mode
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current     = map;
      markersRef.current = L.layerGroup().addTo(map);

      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current     = null;
        markersRef.current = null;
      }
    };
  }, []); // empty — run only once

  /* ── Render Markers (on ready or filter change) ─────── */
  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !markersRef.current) return;

    // dynamically require leaflet (already loaded)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet');
    markersRef.current.clearLayers();

    const visible = bangaloreAreas.filter(a => {
      if (filters.tier !== 'All' && a.tier !== filters.tier) return false;
      if (filters.zone !== 'All' && a.zone !== filters.zone) return false;
      if (a.investmentScore < filters.minScore) return false;
      return true;
    });

    visible.forEach(area => {
      const color  = getPriceColor(area.avgPricePerSqft);
      const size   = area.tier === 'Premium' ? 46 : area.tier === 'Mid' ? 38 : 32;
      const priceK = (area.avgPricePerSqft / 1000).toFixed(1);

      const icon = L.divIcon({
        html: `
          <div style="
            width:${size}px; height:${size}px;
            background:${color}25;
            border: 2.5px solid ${color};
            border-radius: 50%;
            display:flex; align-items:center; justify-content:center;
            box-shadow: 0 2px 12px ${color}60;
            cursor:pointer;
            position:relative;
          ">
            <span style="font-size:${Math.round(size*0.27)}px; font-weight:800; color:${color}; font-family:'Space Grotesk',sans-serif; line-height:1;">${priceK}K</span>
            <div style="
              position:absolute; bottom:-16px; left:50%; transform:translateX(-50%);
              font-size:9px; color:#374151; white-space:nowrap;
              background:rgba(255,255,255,0.92); padding:1px 5px; border-radius:4px;
              box-shadow:0 1px 4px rgba(0,0,0,0.15); font-weight:600;
              font-family:Inter,sans-serif;
            ">${area.name}</div>
          </div>`,
        className: '',
        iconSize:   [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([area.lat, area.lng], { icon });
      marker.on('click', () => {
        setSelectedArea(area);
        mapRef.current?.setView([area.lat, area.lng], 13, { animate: true });
      });
      markersRef.current!.addLayer(marker);

      // heat radius
      const circle = L.circle([area.lat, area.lng], {
        radius: 1100,
        fillColor: color,
        fillOpacity: 0.07,
        color: color,
        weight: 1,
        opacity: 0.18,
      });
      markersRef.current!.addLayer(circle);
    });
  }, [filters]);

  useEffect(() => {
    if (mapReady) renderMarkers();
  }, [mapReady, renderMarkers]);

  /* ── Visible count ──────────────────────────────────── */
  const visibleCount = bangaloreAreas.filter(a => {
    if (filters.tier !== 'All' && a.tier !== filters.tier) return false;
    if (filters.zone !== 'All' && a.zone !== filters.zone) return false;
    if (a.investmentScore < filters.minScore) return false;
    return true;
  }).length;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div style={{ height: '100vh', paddingTop: 60, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ── Top Filter Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 20px', flexWrap: 'wrap',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 4 }}>
          <MapPin size={14} style={{ color: 'var(--violet)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Bangalore Explorer</span>
        </div>

        {/* Filters */}
        {[
          { label: 'Tier', key: 'tier', options: [['All','All Tiers'],['Premium','Premium'],['Mid','Mid-range'],['Affordable','Affordable']] },
          { label: 'Zone', key: 'zone', options: [['All','All Zones'],['North','North'],['South','South'],['East','East'],['West','West'],['Central','Central']] },
        ].map(({ key, options }) => (
          <select key={key}
            value={filters[key as keyof FilterState] as string}
            onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
            style={{
              fontSize: 12, padding: '6px 10px', borderRadius: 8, outline: 'none', cursor: 'pointer',
              background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          >
            {(options as string[][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Min Score</span>
          <input type="range" min="0" max="90" step="10"
            value={filters.minScore}
            onChange={e => setFilters(f => ({ ...f, minScore: parseInt(e.target.value) }))}
            style={{ width: 70, accentColor: 'var(--violet)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--violet)', minWidth: 26 }}>{filters.minScore}+</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
            {visibleCount} areas · click a bubble
          </span>
          <button onClick={() => setShowLegend(s => !s)} style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 7,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--muted2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}>
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
        </div>
      </div>

      {/* ── Map Area ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Leaflet container — must be visible & sized before initialisation */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Loading overlay */}
        {!mapReady && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1001,
            background: 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 14 }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--violet)' }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }}
                  />
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted2)', fontWeight: 500 }}>Initialising map…</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <AnimatePresence>
          {showLegend && (
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              className="card"
              style={{ position: 'absolute', bottom: 28, left: 16, zIndex: 999, padding: '14px 18px', fontSize: 12, minWidth: 180 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: 12 }}>Price per sqft</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { color: '#FF4444', label: '₹13,000+ Premium' },
                  { color: '#FF8C00', label: '₹9,000–13,000 Upper Mid' },
                  { color: '#DAA520', label: '₹6,500–9,000 Mid' },
                  { color: '#4CAF50', label: '₹5,000–6,500 Lower Mid' },
                  { color: '#00C853', label: 'Below ₹5,000 Affordable' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--muted2)', fontSize: 11 }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--muted)' }}>
                Bubble size = Market tier
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Area Detail Panel */}
        <AnimatePresence>
          {selectedArea && (
            <AreaPanel key={selectedArea.id} area={selectedArea} onClose={() => setSelectedArea(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
