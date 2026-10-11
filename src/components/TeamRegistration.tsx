import React, { useState } from 'react';
import type { Team } from '../types/leaderboard';
import { registerTeam, updateTeamName } from '../lib/supabase';
import {
  UserPlus,
  Search,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  KeyRound,
} from 'lucide-react';

interface TeamRegistrationProps {
  teams: Team[];
  onDataChanged: () => void;
  onBackToPublic: () => void;
}

export const TeamRegistration: React.FC<TeamRegistrationProps> = ({
  teams,
  onDataChanged,
  onBackToPublic,
}) => {
  const [mode, setMode] = useState<'register' | 'edit'>('register');

  // Register state
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  // Edit state
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const switchMode = (next: 'register' | 'edit') => {
    setMode(next);
    setLookupError('');
    setEditingTeam(null);
  };

  // Register a new team — only the name is required, ID is auto-assigned
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = teamName.trim();
    if (!cleanName) {
      showToast('Please enter your team name.', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await registerTeam(cleanName);
    setIsSubmitting(false);

    if (res.success && res.team) {
      setRegisteredTeam(res.team);
      setTeamName('');
      showToast(`Team "${res.team.Team_name}" registered successfully!`, 'success');
      onDataChanged();
    } else {
      showToast(res.error || 'Registration failed. Please try again.', 'error');
    }
  };

  // Find a team by its assigned captain ID
  const handleFindTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = lookupId.trim().toLowerCase();
    if (!cleanId) {
      setLookupError('Enter your Team ID to continue.');
      return;
    }
    const found = teams.find((t) => t.captain_id.trim().toLowerCase() === cleanId);
    if (!found) {
      setLookupError('No team matches that ID. Check the leaderboard or your registration confirmation.');
      return;
    }
    setLookupError('');
    setEditingTeam(found);
    setEditName(found.Team_name);
  };

  // Save the renamed team — points are never modified from this screen
  const handleSaveName = async () => {
    if (!editingTeam) return;
    const cleanName = editName.trim();
    if (!cleanName) {
      showToast('Team name cannot be empty.', 'error');
      return;
    }

    setIsSaving(true);
    const res = await updateTeamName(editingTeam.captain_id, cleanName);
    setIsSaving(false);

    if (res.success) {
      setEditingTeam({ ...editingTeam, Team_name: cleanName });
      showToast('Team details updated. Scores are managed by the organizer.', 'success');
      onDataChanged();
    } else {
      showToast(res.error || 'Failed to update team details.', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: toast.type === 'success' ? 'rgba(6, 78, 59, 0.95)' : 'rgba(127, 29, 29, 0.95)',
            border: toast.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            animation: 'fadeIn 0.2s ease',
            backdropFilter: 'blur(10px)',
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={20} color="#34d399" />
          ) : (
            <AlertTriangle size={20} color="#f87171" />
          )}
          <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '8px' }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '36px 30px',
          borderRadius: '16px',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 229, 255, 0.15)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid var(--electric-blue)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <UserPlus size={30} color="var(--electric-blue)" />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.9rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
              color: '#ffffff',
            }}
          >
            Team Registration
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Join the arena — register your team or update your details. Scores are managed by the organizer only.
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <button
            onClick={() => switchMode('register')}
            className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
          >
            <UserPlus size={16} />
            <span>Register New Team</span>
          </button>
          <button
            onClick={() => switchMode('edit')}
            className={`btn ${mode === 'edit' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
          >
            <Pencil size={16} />
            <span>Edit My Team</span>
          </button>
        </div>

        {/* ============ REGISTER MODE ============ */}
        {mode === 'register' && (
          <>
            {registeredTeam ? (
              <div
                style={{
                  textAlign: 'center',
                  background: 'rgba(6, 78, 59, 0.25)',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  padding: '24px 18px',
                  marginBottom: '18px',
                }}
              >
                <CheckCircle2 size={38} color="#34d399" style={{ marginBottom: '8px' }} />
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                  You're in the arena!
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '6px 0 14px' }}>
                  Team <strong style={{ color: '#fff' }}>"{registeredTeam.Team_name}"</strong> registered with 0 points.
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid var(--electric-blue)',
                    marginBottom: '10px',
                  }}
                >
                  <KeyRound size={16} color="var(--electric-blue)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Your Team ID
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--electric-blue)',
                    }}
                  >
                    {registeredTeam.captain_id}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '8px 0 0' }}>
                  Save this ID — you'll need it to edit your team details later.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                  <button
                    onClick={() => setRegisteredTeam(null)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                  >
                    Register Another Team
                  </button>
                  <button
                    onClick={onBackToPublic}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--electric-blue)',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    Team Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Venom Vipers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input-field"
                    maxLength={60}
                    required
                    autoFocus
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                    Your unique Team ID (like <code style={{ color: 'var(--electric-blue)' }}>ACE004</code>) is assigned
                    automatically after registration.
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting}>
                  <UserPlus size={18} />
                  <span>{isSubmitting ? 'Registering...' : 'Register My Team'}</span>
                </button>
              </form>
            )}
          </>
        )}

        {/* ============ EDIT MODE ============ */}
        {mode === 'edit' && !editingTeam && (
          <form onSubmit={handleFindTeam}>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--electric-blue)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Your Team ID (Captain ID)
              </label>
              <input
                type="text"
                placeholder="e.g. ACE004"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                Shown on your registration confirmation and on the leaderboard.
              </div>
            </div>

            {lookupError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                <AlertTriangle size={16} />
                <span>{lookupError}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <Search size={18} />
              <span>Find My Team</span>
            </button>
          </form>
        )}

        {mode === 'edit' && editingTeam && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                background: 'rgba(5, 7, 15, 0.6)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Editing Team
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: 'var(--electric-blue)',
                }}
              >
                {editingTeam.captain_id}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--electric-blue)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Team Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-field"
                maxLength={60}
                required
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                Points and rounds can only be changed by the tournament organizer.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setEditingTeam(null);
                  setLookupId('');
                  setEditName('');
                }}
                className="btn btn-outline"
                style={{ flex: 1, padding: '11px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                onClick={handleSaveName}
                className="btn btn-primary"
                style={{ flex: 2, padding: '11px' }}
                disabled={isSaving}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Back to public leaderboard */}
        <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={onBackToPublic}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.85rem', padding: '9px' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Public Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamRegistration;
