'use client';

import dynamic from 'next/dynamic';

const MapExplorer = dynamic(() => import('@/components/map/MapExplorer'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', paddingTop: 60 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 14 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: 0, background: '#FA4028',
              animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 14, color: '#5E5D5F', fontFamily: "'Inter', sans-serif" }}>Loading Bangalore map…</p>
      </div>
    </div>
  ),
});

export default function ExplorePage() {
  return <MapExplorer />;
}
