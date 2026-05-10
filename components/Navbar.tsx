'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Brain, ShoppingBag, FileText, Newspaper, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/explore',     label: 'Map' },
  { href: '/invest',      label: 'AI Advisor' },
  { href: '/marketplace', label: 'Listings' },
  { href: '/formalities', label: 'Gov Guide' },
  { href: '/news',        label: 'News' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'border-color 0.25s',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(0,6,61,0.22)' : 'rgba(0,6,61,0.10)'}`,
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: '#00063D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif" }}>N</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, fontSize: 18, color: '#00063D', letterSpacing: '-0.02em' }}>
              NestIQ
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 7px', background: '#00063D', color: '#fff', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>
              BLR
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '4px 14px 6px',
                    fontSize: 14, fontWeight: active ? 500 : 400,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '-0.01em',
                    color: active ? '#00063D' : '#5E5D5F',
                    borderBottom: active ? '2px solid #FA4028' : '2px solid transparent',
                    transition: 'color 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.color = '#00063D'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.color = '#5E5D5F'; }}>
                    {label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="desktop-nav">
            <Link href="/marketplace" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#FA4028', color: '#fff', border: 'none', borderRadius: 0, padding: '10px 20px', fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", cursor: 'pointer', letterSpacing: '-0.01em' }}>
                List Property
              </button>
            </Link>
          </div>

          <button className="mobile-nav" onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', color: '#5E5D5F', cursor: 'pointer', padding: 4 }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: '#fff', borderTop: '1px solid rgba(0,6,61,0.10)' }}>
            <div style={{ padding: '12px 24px 20px' }}>
              {navLinks.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '11px 0', fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: active ? 500 : 400, color: active ? '#00063D' : '#5E5D5F', borderBottom: '1px solid rgba(0,6,61,0.08)' }}>
                      {label}
                    </div>
                  </Link>
                );
              })}
              <Link href="/marketplace" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <button style={{ background: '#FA4028', color: '#fff', border: 'none', borderRadius: 0, padding: '12px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 16, fontFamily: "'Inter', sans-serif" }}>
                  List Property
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
        @media (min-width: 769px) { .mobile-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}
