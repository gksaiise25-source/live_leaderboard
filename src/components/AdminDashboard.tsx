import React, { useState } from 'react';
import type { Team } from '../types/leaderboard';
import {
  addTeam,
  updateScores,
  updateTeamInfo,
  deleteTeam,
  seedSampleTeams,
  resetAllScores,
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  ShieldCheck,
  PlusCircle,
  Trash2,
  Edit2,
  Save,
  Search,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Database,
  ArrowLeft,
} from 'lucide-react';

interface AdminDashboardProps {
  teams: Team[];
  onDataChanged: () => void;
  onBackToPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  teams,
  onDataChanged,
  onBackToPublic,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ace_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Search in Admin
  const [adminSearch, setAdminSearch] = useState('');

  // Add Team Form State
  const [newCaptainId, setNewCaptainId] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  // Score Edits in progress: map of captain_id -> { round1: number, round2: number, dirty: boolean }
  const [scoreInputs, setScoreInputs] = useState<
    Record<string, { round1: number; round2: number; isDirty: boolean }>
  >({});

  // Editing Team Info Modal State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editCaptainId, setEditCaptainId] = useState('');
  const [editTeamName, setEditTeamName] = useState('');

  // Delete Confirmation Modal State
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  // Status Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || '';
    if (envPass && passwordInput.trim() === envPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ace_admin_auth', 'true');
      setAuthError('');
      showToast('Organizer access granted. Welcome back!', 'success');
    } else {
      setAuthError('Invalid organizer passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ace_admin_auth');
    showToast('Signed out of admin dashboard.', 'success');
  };

  // Add Team Handler
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newCaptainId.trim();
    const cleanName = newTeamName.trim();

    if (!cleanId || !cleanName) {
      showToast('Captain ID and Team Name are required.', 'error');
      return;
    }

    // Check duplicate in memory first
    if (teams.some((t) => t.captain_id.toLowerCase() === cleanId.toLowerCase())) {
      showToast(`Captain ID "${cleanId}" already exists. Please use a unique ID.`, 'error');
      return;
    }

    setIsAddingTeam(true);
    const res = await addTeam(cleanId, cleanName);
    setIsAddingTeam(false);

    if (res.success) {
      setNewCaptainId('');
      setNewTeamName('');
      showToast(`Team "${cleanName}" (${cleanId}) successfully enrolled with 0 initial scores!`, 'success');
      onDataChanged();
    } else {
      showToast(res.error || 'Failed to add team.', 'error');
    }
  };

  // Score Input Change
  const handleScoreChange = (captain_id: string, round: 'round1' | 'round2', value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    const current = scoreInputs[captain_id] || {
      round1: teams.find((t) => t.captain_id === captain_id)?.round1_score || 0,
      round2: teams.find((t) => t.captain_id === captain_id)?.round2_score || 0,
      isDirty: false,
    };

    setScoreInputs((prev) => ({
      ...prev,
      [captain_id]: {
        ...current,
        [round]: num,
        isDirty: true,
      },
    }));
  };

  // Save Score Handler
  const handleSaveScore = async (captain_id: string) => {
    const input = scoreInputs[captain_id];
    if (!input) return;

    if (input.round1 < 0 || input.round2 < 0) {
      showToast('Scores must be non-negative numbers.', 'error');
      return;
    }

    const res = await updateScores(captain_id, input.round1, input.round2);
    if (res.success) {
      showToast(
        `Scores saved for ${captain_id}! Final Points: ${input.round1 + input.round2}`,
        'success'
      );
      // Mark as not dirty
      setScoreInputs((prev) => ({
        ...prev,
        [captain_id]: { ...input, isDirty: false },
      }));
      onDataChanged();
    } else {
      showToast(res.error || 'Failed to update scores.', 'error');
    }
  };

  // Edit Team Info Save Handler
  const handleSaveTeamInfo = async () => {
    if (!editingTeam) return;
    const cleanId = editCaptainId.trim();
    const cleanName = editTeamName.trim();

    if (!cleanId || !cleanName) {
      showToast('Captain ID and Team Name cannot be empty.', 'error');
      return;
    }

    const res = await updateTeamInfo(editingTeam.captain_id, cleanId, cleanName);
    if (res.success) {
      showToast('Team details updated successfully.', 'success');
      setEditingTeam(null);
      onDataChanged();
    } else {
      showToast(res.error || 'Failed to update team info.', 'error');
    }
  };

  // Delete Team Handler
  const handleConfirmDelete = async () => {
    if (!deletingTeam) return;
    const res = await deleteTeam(deletingTeam.captain_id);
    if (res.success) {
      showToast(`Team "${deletingTeam.Team_name}" has been deleted.`, 'success');
      setDeletingTeam(null);
      onDataChanged();
    } else {
      showToast(res.error || 'Failed to delete team.', 'error');
    }
  };

  // Seed Initial Sample Teams
  const handleSeedSamples = async () => {
    const res = await seedSampleTeams();
    if (res.success) {
      showToast('Sample teams (ACE001, ACE002, ACE003) seeded with 0 scores.', 'success');
      onDataChanged();
    } else {
      showToast(res.error || 'Failed to seed sample teams.', 'error');
    }
  };

  // Reset all scores to 0
  const handleResetScores = async () => {
    if (window.confirm('Reset Round 1 and Round 2 scores for ALL teams to 0?')) {
      const res = await resetAllScores();
      if (res.success) {
        showToast('All team scores reset to 0.', 'success');
        setScoreInputs({});
        onDataChanged();
      } else {
        showToast(res.error || 'Failed to reset scores.', 'error');
      }
    }
  };

  // Filter teams in admin
  const filteredTeams = teams.filter((t) => {
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase().trim();
    return t.captain_id.toLowerCase().includes(q) || t.Team_name.toLowerCase().includes(q);
  });

  // Render Gate if Not Authenticated
  if (!isAuthenticated) {
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
        <div
          className="glass-panel"
          style={{
            maxWidth: '440px',
            width: '100%',
            padding: '36px 30px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 23, 68, 0.4)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 23, 68, 0.2)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 23, 68, 0.12)',
              border: '1px solid var(--spider-red)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Lock size={30} color="var(--spider-red)" />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
              color: '#ffffff',
            }}
          >
            Organizer Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Enter your tournament organizer passcode to manage teams, scores, and tournament data.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--electric-blue)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '6px',
                }}
              >
                Organizer Passcode
              </label>
              <input
                type="password"
                placeholder="Enter passcode"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>

            {authError && (
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
                  textAlign: 'left',
                }}
              >
                <AlertTriangle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <ShieldCheck size={18} />
              <span>Authorize & Enter</span>
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={onBackToPublic}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Public Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Organizer Dashboard View
  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px 60px 16px', position: 'relative', zIndex: 10 }}>
      {/* Toast Notification */}
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
          {toast.type === 'success' ? <CheckCircle2 size={20} color="#34d399" /> : <AlertTriangle size={20} color="#f87171" />}
          <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '8px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Top Navigation & Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 23, 68, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onBackToPublic}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <ArrowLeft size={14} />
              <span>Public View</span>
            </button>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                color: 'var(--electric-blue)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <ShieldCheck size={14} />
              <span>Admin Mode</span>
            </div>
            {isSupabaseConfigured ? (
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={13} /> Supabase PostgreSQL Connected
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={13} /> Local / Demo Mode Active
              </span>
            )}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.4rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#ffffff',
              margin: '8px 0 0 0',
            }}
          >
            Tournament Management Console
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            Add teams, edit captain details, update Round 1 & Round 2 scores. Final Points are calculated automatically.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleSeedSamples} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
            <Sparkles size={15} color="var(--gold-accent)" />
            <span>Seed Samples</span>
          </button>
          <button onClick={handleResetScores} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
            <RotateCcw size={15} color="var(--spider-red)" />
            <span>Reset Scores</span>
          </button>
          <button onClick={handleLogout} className="btn btn-danger" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column (Add Team Form) & Right Column (Score Overview) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Card: Add Team */}
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--electric-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <PlusCircle size={22} color="var(--electric-blue)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Enroll New Team
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            New teams start with Round 1 = 0, Round 2 = 0, and Final Points = 0.
          </p>

          <form onSubmit={handleAddTeam}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--electric-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Captain ID (Unique)
              </label>
              <input
                type="text"
                placeholder="e.g. ACE004"
                value={newCaptainId}
                onChange={(e) => setNewCaptainId(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--electric-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Team Name
              </label>
              <input
                type="text"
                placeholder="e.g. Venom Vipers"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isAddingTeam}>
              <PlusCircle size={18} />
              <span>{isAddingTeam ? 'Enrolling...' : 'Enroll Team'}</span>
            </button>
          </form>
        </div>

        {/* Card: Quick Scoring Rules & Auto-Calculation Info */}
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--spider-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Database size={22} color="var(--spider-red)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Automatic Calculation Engine
            </h3>
          </div>
          <div style={{ background: 'rgba(5, 7, 15, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '14px' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#ff1744', fontWeight: 700, marginBottom: '4px' }}>
              final_points = round1_score + round2_score
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              The organizer never enters final points manually. The database-level generated column updates instant totals and live standings automatically.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <div>✓ Non-negative numbers validated</div>
            <div>✓ Realtime sync broadcasts score shifts across all connected screens</div>
            <div>✓ Competition ranking (1, 2, 2, 4) applied automatically</div>
          </div>
        </div>
      </div>

      {/* Team Roster & Score Editor Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Active Roster & Score Management
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Directly edit round scores in the table below and click Save.
            </p>
          </div>

          {/* Search in Admin */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search team or captain..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '34px', fontSize: '0.85rem', paddingBottom: '6px', paddingTop: '6px' }}
            />
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            No teams match your search. Add teams above or click "Seed Samples".
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255, 23, 68, 0.3)', background: 'rgba(6, 9, 20, 0.8)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--electric-blue)', textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.08em' }}>
                    Captain ID
                  </th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.08em' }}>
                    Team Name
                  </th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.82rem', textAlign: 'center', width: '130px' }}>
                    Round 1 Score
                  </th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.82rem', textAlign: 'center', width: '130px' }}>
                    Round 2 Score
                  </th>
                  <th style={{ padding: '12px 16px', color: 'var(--spider-red)', textTransform: 'uppercase', fontSize: '0.82rem', textAlign: 'center', width: '130px' }}>
                    Final Points
                  </th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.82rem', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => {
                  const state = scoreInputs[team.captain_id];
                  const r1 = state !== undefined ? state.round1 : team.round1_score;
                  const r2 = state !== undefined ? state.round2 : team.round2_score;
                  const computedFinal = r1 + r2;
                  const isDirty = state ? state.isDirty : false;

                  return (
                    <tr
                      key={team.captain_id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isDirty ? 'rgba(255, 23, 68, 0.04)' : 'transparent',
                      }}
                    >
                      {/* Captain ID */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(0, 229, 255, 0.1)',
                            border: '1px solid rgba(0, 229, 255, 0.3)',
                            color: 'var(--electric-blue)',
                            fontSize: '0.88rem',
                          }}
                        >
                          {team.captain_id}
                        </span>
                      </td>

                      {/* Team Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                          {team.Team_name}
                        </div>
                      </td>

                      {/* Round 1 Score Input */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={r1}
                          onChange={(e) => handleScoreChange(team.captain_id, 'round1', e.target.value)}
                          className="input-field"
                          style={{
                            width: '90px',
                            textAlign: 'center',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            fontSize: '1rem',
                            padding: '6px 8px',
                          }}
                        />
                      </td>

                      {/* Round 2 Score Input */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={r2}
                          onChange={(e) => handleScoreChange(team.captain_id, 'round2', e.target.value)}
                          className="input-field"
                          style={{
                            width: '90px',
                            textAlign: 'center',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            fontSize: '1rem',
                            padding: '6px 8px',
                          }}
                        />
                      </td>

                      {/* Automatically Computed Final Points */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(255, 23, 68, 0.12)',
                            border: '1px solid rgba(255, 23, 68, 0.35)',
                            color: '#ff1744',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            fontSize: '1.15rem',
                          }}
                        >
                          {computedFinal}
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>PTS</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {/* Save Score Button */}
                          <button
                            onClick={() => handleSaveScore(team.captain_id)}
                            className={`btn ${isDirty ? 'btn-primary' : 'btn-secondary'}`}
                            title="Save updated scores to database"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          >
                            <Save size={14} />
                            <span>{isDirty ? 'Save *' : 'Save'}</span>
                          </button>

                          {/* Edit Team Info */}
                          <button
                            onClick={() => {
                              setEditingTeam(team);
                              setEditCaptainId(team.captain_id);
                              setEditTeamName(team.Team_name);
                            }}
                            className="btn btn-outline"
                            title="Edit Captain ID or Team Name"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete Team */}
                          <button
                            onClick={() => setDeletingTeam(team)}
                            className="btn btn-danger"
                            title="Delete Team"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Edit Team Info */}
      {editingTeam && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--electric-blue)',
              boxShadow: '0 0 30px var(--electric-blue-glow)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '16px',
                textTransform: 'uppercase',
              }}
            >
              Modify Team Details
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--electric-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Captain ID
              </label>
              <input
                type="text"
                value={editCaptainId}
                onChange={(e) => setEditCaptainId(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--electric-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Team Name
              </label>
              <input
                type="text"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingTeam(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                Cancel
              </button>
              <button onClick={handleSaveTeamInfo} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Team Confirmation */}
      {deletingTeam && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--spider-red)',
              boxShadow: '0 0 30px var(--spider-red-glow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <AlertTriangle size={24} color="var(--spider-red)" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                Confirm Team Deletion
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
              Are you sure you want to permanently delete team{' '}
              <strong style={{ color: '#fff' }}>"{deletingTeam.Team_name}"</strong> ({deletingTeam.captain_id})? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeletingTeam(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn btn-danger" style={{ padding: '8px 16px' }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
