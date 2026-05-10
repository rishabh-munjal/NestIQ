// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'NestIQ — Bangalore Smart Real Estate Intelligence',
  description: 'AI-powered real estate intelligence for Bangalore. Explore property rates, connect with sellers, navigate government formalities, and get AI investment recommendations based on news and government announcements.',
  keywords: 'Bangalore real estate, property rates, AI investment, BBMP, RERA Karnataka, buy property Bangalore',
  openGraph: {
    title: 'NestIQ — Bangalore Real Estate Intelligence',
    description: 'AI-powered property intelligence platform for Bangalore',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
