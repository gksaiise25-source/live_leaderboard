import React from 'react';
import { SpiderLogo } from './SpiderLogo';
import { Trophy, Users, Zap, Radio } from 'lucide-react';

interface HeaderProps {
  totalTeams: number;
  leadingPoints: number;
  isConnectedToSupabase: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalTeams,
  leadingPoints,
  isConnectedToSupabase,
}) => {
  return (
    <header style={{ textAlign: 'center', padding: '36px 16px 24px 16px', position: 'relative', zIndex: 10 }}>
      {/* Spider Logo & Live Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <SpiderLogo size={52} />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 23, 68, 0.12)',
            border: '1px solid rgba(255, 23, 68, 0.4)',
            padding: '4px 14px',
            borderRadius: '999px',
            boxShadow: '0 0 16px rgba(255, 23, 68, 0.25)',
          }}
        >
          <span className="live-beacon" />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#ff1744',
              textTransform: 'uppercase',
            }}
          >
            Live Broadcast
          </span>
        </div>
      </div>

      {/* Main Bold Heading: ACE CLUB */}
      <h1
        className="brand-title"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.8rem, 6.5vw, 4.5rem)',
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: '0 0 4px 0',
          lineHeight: 1.05,
          background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 25px rgba(255, 23, 68, 0.4))',
        }}
      >
        ACE CLUB
      </h1>

      {/* Subtitle: LIVE LEADERBOARD */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2.5vw, 1.45rem)',
          fontWeight: 700,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'var(--electric-blue)',
          textShadow: '0 0 15px rgba(0, 229, 255, 0.65)',
          marginBottom: '28px',
        }}
      >
        LIVE LEADERBOARD
      </div>

      {/* Tournament Live Metrics Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          maxWidth: '850px',
          margin: '0 auto',
        }}
      >
        {/* Total Teams */}
        <div
          className="glass-panel"
          style={{
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderLeft: '3px solid var(--electric-blue)',
          }}
        >
          <Users size={18} color="var(--electric-blue)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Enrolled Teams
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              {totalTeams} Teams
            </div>
          </div>
        </div>

        {/* Highest Score */}
        <div
          className="glass-panel"
          style={{
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderLeft: '3px solid var(--gold-accent)',
          }}
        >
          <Trophy size={18} color="var(--gold-accent)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Highest Score
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--gold-accent)' }}>
              {leadingPoints} PTS
            </div>
          </div>
        </div>

        {/* Active Stage */}
        <div
          className="glass-panel"
          style={{
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderLeft: '3px solid var(--spider-red)',
          }}
        >
          <Zap size={18} color="var(--spider-red)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tournament Mode
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              Round 1 & Round 2
            </div>
          </div>
        </div>

        {/* Backend Realtime Status */}
        <div
          className="glass-panel"
          style={{
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderLeft: isConnectedToSupabase ? '3px solid #10b981' : '3px solid #6366f1',
          }}
        >
          <Radio size={18} color={isConnectedToSupabase ? '#10b981' : '#818cf8'} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sync Engine
            </div>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: isConnectedToSupabase ? '#34d399' : '#a5b4fc',
              }}
            >
              {isConnectedToSupabase ? 'Supabase Realtime' : 'Local / Multi-Tab Sync'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
