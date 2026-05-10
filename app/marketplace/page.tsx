'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { Search, MapPin, Building2, Bed, Square, Phone, Mail, CheckCircle, X, Plus, Shield, Home, TrendingUp } from 'lucide-react';
import { propertyListings, PropertyListing, formatPrice } from '@/lib/data/propertyListings';
import { bangaloreAreas } from '@/lib/data/bangaloreAreas';

const bhkOptions  = ['All', '1BHK', '2BHK', '3BHK', '4BHK+', 'Studio', 'Plot'];
const typeOptions = ['All', 'Apartment', 'Villa', 'Independent House', 'Plot'];

// Jasper accent colors for types
const typeColors: Record<string, string> = {
  'Apartment': '#00063D', 'Villa': '#FA4028', 'Plot': '#103A00', 'Independent House': '#0095FF',
};

// ─── Price Chart ──────────────────────────────────────────────
function PriceDistChart({ listings }: { listings: PropertyListing[] }) {
  const buckets: Record<string, number> = { '<50L': 0, '50L–1Cr': 0, '1–2Cr': 0, '2–5Cr': 0, '>5Cr': 0 };
  listings.forEach(l => {
    if (l.price < 5e6) buckets['<50L']++;
    else if (l.price < 1e7) buckets['50L–1Cr']++;
    else if (l.price < 2e7) buckets['1–2Cr']++;
    else if (l.price < 5e7) buckets['2–5Cr']++;
    else buckets['>5Cr']++;
  });
  const data = Object.entries(buckets).map(([name, value]) => ({ name, value }));
  const colors = ['#00063D', '#FA4028', '#00063D', '#FA4028', '#00063D'];

  return (
    <ResponsiveContainer width="100%" height={90}>
      <BarChart data={data} margin={{ top: 0, bottom: 0, left: -20, right: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#5E5D5F' }} />
        <YAxis tick={{ fontSize: 9, fill: '#5E5D5F' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid rgba(0,6,61,0.12)', borderRadius: 0, fontSize: 11 }}
          labelStyle={{ color: '#5E5D5F' }} itemStyle={{ color: '#00063D', fontWeight: 600 }}
          cursor={{ fill: 'rgba(0,6,61,0.03)' }}
        />
        <Bar dataKey="value" name="Listings" radius={[0, 0, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Contact Modal ────────────────────────────────────────────
function ContactModal({ property, onClose }: { property: PropertyListing; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,6,61,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        style={{ background: '#fff', border: '1px solid rgba(0,6,61,0.12)', width: '100%', maxWidth: 440, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, color: '#00063D', letterSpacing: '-0.02em' }}>Contact Seller</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5E5D5F', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {!sent ? (
          <>
            <div style={{ padding: '12px 16px', background: '#F9F9F9', marginBottom: 18, border: '1px solid rgba(0,6,61,0.08)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#00063D', marginBottom: 3 }}>{property.title}</p>
              <p style={{ fontSize: 11, color: '#5E5D5F' }}>{property.areaName} · {property.bhk} · {formatPrice(property.price)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {[{ Icon: Phone, label: 'Phone', value: property.sellerPhone }, { Icon: Mail, label: 'Email', value: property.sellerEmail }].map(({ Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: '#F9F9F9', border: '1px solid rgba(0,6,61,0.08)' }}>
                  <Icon size={14} style={{ color: '#FA4028', flexShrink: 0 }} />
                  <div><p style={{ fontSize: 10, color: '#5E5D5F', marginBottom: 2 }}>{label}</p><p style={{ fontSize: 13, fontWeight: 600, color: '#00063D' }}>{value}</p></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              <input className="input" placeholder="Your name" />
              <input className="input" placeholder="Your phone number" />
              <textarea className="input" rows={2} style={{ resize: 'none', fontFamily: 'inherit' }}
                defaultValue={`Hi ${property.sellerName}, I'm interested in your property in ${property.areaName}.`} />
            </div>
            <button style={{ background: '#FA4028', color: '#fff', border: 'none', borderRadius: 0, padding: '14px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', fontFamily: "'Inter', sans-serif" }} onClick={() => setSent(true)}>Send Enquiry</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 52, height: 52, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E6FFD9', border: '1px solid rgba(16,58,0,0.2)' }}>
              <CheckCircle size={24} style={{ color: '#103A00' }} />
            </div>
            <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: '#00063D', marginBottom: 8 }}>Enquiry Sent!</h4>
            <p style={{ fontSize: 13, color: '#5E5D5F', marginBottom: 20 }}>{property.sellerName} will reply within 24 hours.</p>
            <button style={{ background: 'transparent', color: '#00063D', border: '1px solid rgba(0,6,61,0.22)', borderRadius: 0, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }} onClick={onClose}>Done</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Add Listing Modal ────────────────────────────────────────
function AddListingModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,6,61,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#fff', border: '1px solid rgba(0,6,61,0.12)', width: '100%', maxWidth: 480, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, color: '#00063D', letterSpacing: '-0.02em' }}>List Your Property</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5E5D5F', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {!submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="Property Title *" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <select className="input" style={{ color: '#00063D' }}>{bangaloreAreas.map(a => <option key={a.id}>{a.name}</option>)}</select>
              <select className="input" style={{ color: '#00063D' }}>{bhkOptions.slice(1).map(b => <option key={b}>{b}</option>)}</select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="input" placeholder="Price (₹) *" type="number" />
              <input className="input" placeholder="Area (sqft) *" type="number" />
            </div>
            <select className="input" style={{ color: '#00063D' }}>{typeOptions.slice(1).map(t => <option key={t}>{t}</option>)}</select>
            <textarea className="input" rows={2} placeholder="Description" style={{ resize: 'none', fontFamily: 'inherit' }} />
            <input className="input" placeholder="Your Name *" />
            <input className="input" placeholder="Phone Number *" />
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#E6FFD9', border: '1px solid rgba(16,58,0,0.15)', fontSize: 12, color: '#103A00' }}>
              <Shield size={13} style={{ color: '#103A00', flexShrink: 0, marginTop: 1 }} />
              Listed after verification · Zero brokerage charged
            </div>
            <button style={{ background: '#FA4028', color: '#fff', border: 'none', borderRadius: 0, padding: '14px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 4, fontFamily: "'Inter', sans-serif" }} onClick={() => setSubmitted(true)}>Submit Listing</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 52, height: 52, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E6FFD9', border: '1px solid rgba(16,58,0,0.2)' }}>
              <CheckCircle size={24} style={{ color: '#103A00' }} />
            </div>
            <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: '#00063D', marginBottom: 8 }}>Listed!</h4>
            <p style={{ fontSize: 13, color: '#5E5D5F', marginBottom: 20 }}>Your property appears within 24 hours.</p>
            <button style={{ background: 'transparent', color: '#00063D', border: '1px solid rgba(0,6,61,0.22)', borderRadius: 0, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }} onClick={onClose}>Done</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────
function ListingCard({ property, onContact }: { property: PropertyListing; onContact: (p: PropertyListing) => void }) {
  const tc = typeColors[property.type] || '#00063D';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#F9F9F9', border: '1px solid rgba(0,6,61,0.10)', overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,6,61,0.22)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,6,61,0.10)'}>

      {/* Color band */}
      <div style={{ height: 3, background: tc }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Price header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, color: '#00063D', letterSpacing: '-0.02em' }}>{formatPrice(property.price)}</div>
            <div style={{ fontSize: 11, color: '#5E5D5F' }}>₹{property.pricePerSqft.toLocaleString('en-IN')}/sqft</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            {property.tag && <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 7px', background: tc, color: '#fff', fontFamily: "'DM Mono', monospace" }}>{property.tag}</span>}
            {property.isRERA && <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 7px', background: '#E6FFD9', color: '#103A00', fontFamily: "'DM Mono', monospace" }}>✓ RERA</span>}
          </div>
        </div>

        {/* Title + area */}
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#00063D', lineHeight: 1.4, marginBottom: 5, fontFamily: "'Inter', sans-serif",
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {property.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5E5D5F', marginBottom: 12 }}>
          <MapPin size={10} />{property.areaName}
        </div>

        {/* Specs */}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#5E5D5F', marginBottom: 12, letterSpacing: '-0.01em' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bed size={11} />{property.bhk}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Square size={11} />{property.sqft.toLocaleString()}</span>
          {property.floor && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={11} />Fl {property.floor}</span>}
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#5E5D5F' }}>{property.possession}</span>
        </div>

        {/* Seller + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 11, borderTop: '1px solid rgba(0,6,61,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: '#00063D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif" }}>
              {property.sellerName[0]}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#00063D' }}>{property.sellerName}</p>
              {property.isVerified && <p style={{ fontSize: 10, color: '#103A00', display: 'flex', alignItems: 'center', gap: 3 }}><Shield size={9} />Verified</p>}
            </div>
          </div>
          <button style={{ background: 'transparent', color: '#00063D', border: '1px solid rgba(0,6,61,0.22)', borderRadius: 0, fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 500 }} onClick={() => onContact(property)}>Contact</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [search,   setSearch]   = useState('');
  const [bhk,      setBhk]      = useState('All');
  const [type,     setType]     = useState('All');
  const [area,     setArea]     = useState(searchParams.get('area') || 'All');
  const [sortBy,   setSortBy]   = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [contact,  setContact]  = useState<PropertyListing | null>(null);
  const [showForm, setShowForm] = useState(searchParams.get('tab') === 'sell');

  const filtered = propertyListings
    .filter(p => {
      if (bhk !== 'All' && p.bhk !== bhk) return false;
      if (type !== 'All' && p.type !== type) return false;
      if (area !== 'All' && p.areaId !== area) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
          !p.areaName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortBy === 'price-asc' ? a.price - b.price : sortBy === 'price-desc' ? b.price - a.price :
      new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  const avgPrice = filtered.length ? Math.round(filtered.reduce((s, p) => s + p.pricePerSqft, 0) / filtered.length) : 0;
  const reraCount = filtered.filter(p => p.isRERA).length;

  return (
    <div className="page-shell">
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Zero Brokerage · Verified Sellers</div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 600, color: '#00063D', letterSpacing: '-0.02em' }}>Marketplace</h1>
          </div>
          <button style={{ background: '#FA4028', color: '#fff', border: 'none', borderRadius: 0, padding: '12px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowForm(true)}>
            <Plus size={14} />List Property
          </button>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, marginBottom: 20, background: 'rgba(0,6,61,0.08)' }}>
          {[
            { label: 'Listings Found', value: filtered.length, suffix: '' },
            { label: 'Avg ₹/sqft',    value: `₹${avgPrice.toLocaleString('en-IN')}`, suffix: '' },
            { label: 'RERA Verified', value: reraCount, suffix: ` / ${filtered.length}` },
            { label: 'Price Range',  value: filtered.length ? `${formatPrice(Math.min(...filtered.map(p => p.price)))}` : '—', suffix: '+' },
          ].map((k, i) => (
            <div key={k.label} style={{ background: '#F9F9F9', padding: '18px 20px' }}>
              <p className="label" style={{ marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#00063D', letterSpacing: '-0.02em' }}>{k.value}<span style={{ fontSize: 13, fontWeight: 400 }}>{k.suffix}</span></p>
            </div>
          ))}
        </div>

        {/* Price distribution chart */}
        {filtered.length > 0 && (
          <div style={{ background: '#F9F9F9', border: '1px solid rgba(0,6,61,0.10)', padding: '14px 20px', marginBottom: 18 }}>
            <p className="label" style={{ marginBottom: 8 }}>Price Distribution</p>
            <PriceDistChart listings={filtered} />
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, padding: '14px 16px', background: '#F9F9F9', border: '1px solid rgba(0,6,61,0.10)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#5E5D5F' }} />
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Search area or project…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {[
            { value: area,   change: setArea,   opts: [['All', 'All Areas'], ...bangaloreAreas.map(a => [a.id, a.name])] },
            { value: bhk,    change: setBhk,    opts: bhkOptions.map(o => [o, o]) },
            { value: type,   change: setType,   opts: typeOptions.map(o => [o, o]) },
            { value: sortBy, change: setSortBy, opts: [['newest','Newest'],['price-asc','Price ↑'],['price-desc','Price ↓']] },
          ].map((s, i) => (
            <select key={i} className="input" style={{ width: 'auto', color: '#00063D', background: '#fff' }}
              value={s.value} onChange={e => s.change(e.target.value as any)}>
              {(s.opts as string[][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 1, background: 'rgba(0,6,61,0.08)' }}>
          {/* Add card */}
          <div onClick={() => setShowForm(true)} style={{
            border: 'none', background: '#F9F9F9',
            minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', transition: 'background 0.15s', padding: 20,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fff'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#F9F9F9'}>
            <div style={{ width: 40, height: 40, background: '#00063D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#00063D', fontFamily: "'Inter', sans-serif" }}>List your property</span>
            <span style={{ fontSize: 11, color: '#5E5D5F', fontFamily: "'DM Mono', monospace" }}>Free · No brokerage</span>
          </div>

          {filtered.map(p => <ListingCard key={p.id} property={p} onContact={setContact} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#5E5D5F' }}>
            <Home size={36} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
            <p style={{ fontSize: 14, fontFamily: "'Inter', sans-serif" }}>No properties found · Try adjusting filters</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {contact  && <ContactModal   property={contact} onClose={() => setContact(null)} />}
        {showForm && <AddListingModal onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="page-shell" />}>
      <MarketplaceContent />
    </Suspense>
  );
}
