import React from 'react';
import { SpiderLogo } from './SpiderLogo';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 10,
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 23, 68, 0.2)',
        background: 'linear-gradient(180deg, rgba(5, 7, 15, 0.7) 0%, rgba(2, 3, 8, 0.95) 100%)',
        padding: '36px 16px 28px 16px',
        textAlign: 'center',
      }}
    >
      {/* City Skyline Silhouette SVG */}
      <div
        style={{
          position: 'absolute',
          top: '-32px',
          left: 0,
          right: 0,
          height: '32px',
          opacity: 0.12,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 60' preserveAspectRatio='none'%3E%3Cpolygon points='0,60 0,40 40,40 40,20 80,20 80,50 120,50 120,10 160,10 160,35 220,35 220,15 280,15 280,50 340,50 340,5 380,5 380,45 440,45 440,25 500,25 500,55 560,55 560,20 620,20 620,40 680,40 680,12 740,12 740,50 800,50 800,18 860,18 860,35 920,35 920,8 980,8 980,45 1040,45 1040,25 1100,25 1100,50 1150,50 1150,20 1200,20 1200,60' fill='%2300e5ff'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '1200px 32px',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <SpiderLogo size={32} />

        {/* Required Motto */}
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 0 10px rgba(255, 23, 68, 0.4)',
          }}
        >
          ACE CLUB • Compete. Conquer. Lead.
        </p>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0, letterSpacing: '0.04em' }}>
          Real-time esports tournament leaderboard engine • Built with Spider-Man Theme
        </p>
      </div>
    </footer>
  );
};
