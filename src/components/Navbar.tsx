import React from 'react';
import { SpiderLogo } from './SpiderLogo';
import { Shield, Monitor, Search, RefreshCw, Volume2, VolumeX, UserPlus } from 'lucide-react';

interface NavbarProps {
  isAdminView: boolean;
  isRegisterView: boolean;
  onToggleAdmin: () => void;
  onToggleRegister: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isProjectorMode: boolean;
  onToggleProjector: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminView,
  isRegisterView,
  onToggleAdmin,
  onToggleRegister,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  isProjectorMode,
  onToggleProjector,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 23, 68, 0.25)',
        boxShadow: '0 4px 25px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left Brand Identity */}
        <div
          onClick={() => {
            if (isAdminView) onToggleAdmin();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <SpiderLogo size={36} />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              ACE CLUB
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--electric-blue)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Official Arena
            </div>
          </div>
        </div>

        {/* Center Search Bar (for quick lookup) */}
        {!isAdminView && !isRegisterView && (
          <div
            style={{
              flex: '1',
              maxWidth: '380px',
              minWidth: '220px',
              position: 'relative',
            }}
          >
            <Search
              size={17}
              color="var(--text-dim)"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search team or captain ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '38px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '0.9rem',
                borderRadius: '999px',
                border: '1px solid rgba(0, 229, 255, 0.25)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            className="btn btn-outline"
            title="Refresh Leaderboard"
            style={{ padding: '8px 12px', borderRadius: '8px' }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            className="btn btn-outline"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            style={{ padding: '8px 12px', borderRadius: '8px' }}
          >
            {soundEnabled ? <Volume2 size={16} color="var(--electric-blue)" /> : <VolumeX size={16} />}
          </button>

          {/* Projector Mode */}
          <button
            onClick={onToggleProjector}
            className={`btn ${isProjectorMode ? 'btn-secondary' : 'btn-outline'}`}
            title="Toggle Big Screen Projector Mode"
            style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.88rem' }}
          >
            <Monitor size={16} />
            <span style={{ display: 'inline' }}>
              {isProjectorMode ? 'Standard' : 'Projector'}
            </span>
          </button>

          {/* Team Registration Portal Link */}
          {!isAdminView && (
            <button
              onClick={onToggleRegister}
              className={`btn ${isRegisterView ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem' }}
            >
              <UserPlus size={16} />
              <span>{isRegisterView ? 'Leaderboard' : 'Register Team'}</span>
            </button>
          )}

          {/* Admin Dashboard Portal Link */}
          <button
            onClick={onToggleAdmin}
            className={`btn ${isAdminView ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem' }}
          >
            <Shield size={16} />
            <span>{isAdminView ? 'Public Board' : 'Admin Portal'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
