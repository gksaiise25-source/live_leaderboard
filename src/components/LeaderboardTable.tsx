import React from 'react';
import type { RankedTeam } from '../types/leaderboard';
import { Crown, Shield, Medal, Flame, SearchX } from 'lucide-react';

interface LeaderboardTableProps {
  teams: RankedTeam[];
  searchQuery: string;
  onClearSearch: () => void;
  onOpenAdmin: () => void;
  onOpenRegister: () => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  teams,
  searchQuery,
  onClearSearch,
  onOpenAdmin,
  onOpenRegister,
}) => {
  // Filter teams if search query is present
  const filteredTeams = teams.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      t.captain_id.toLowerCase().includes(q) ||
      t.Team_name.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px 48px 16px', position: 'relative', zIndex: 10 }}>
      {/* Top Table Controller Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          padding: '0 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} color="var(--spider-red)" />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#ffffff',
            }}
          >
            Championship Standings
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(255, 23, 68, 0.15)',
              color: '#ff1744',
              fontWeight: 700,
            }}
          >
            {filteredTeams.length} {filteredTeams.length === 1 ? 'Team' : 'Teams'}
          </span>
        </div>

        {searchQuery && (
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Showing results for <span style={{ color: 'var(--electric-blue)', fontWeight: 600 }}>"{searchQuery}"</span>
            <button
              onClick={onClearSearch}
              style={{
                marginLeft: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--spider-red)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Leaderboard Container */}
      <div
        className="glass-panel"
        style={{
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid rgba(255, 23, 68, 0.25)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65), 0 0 20px rgba(255, 23, 68, 0.08)',
        }}
      >
        {filteredTeams.length === 0 ? (
          // Empty State
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(255, 23, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 23, 68, 0.3)',
              }}
            >
              <SearchX size={36} color="var(--spider-red)" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: '#ffffff',
                }}
              >
                {searchQuery ? 'No Matching Teams Found' : 'No Teams on the Grid Yet'}
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto', fontSize: '0.95rem' }}>
                {searchQuery
                  ? `No team or captain ID matches "${searchQuery}". Check your spelling or clear search.`
                  : 'The tournament roster is waiting for contenders. Register your team to join — organizers manage scores via the Admin Portal.'}
              </p>
            </div>
            {searchQuery ? (
              <button onClick={onClearSearch} className="btn btn-secondary" style={{ marginTop: '8px' }}>
                Reset Search Filter
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                <button onClick={onOpenRegister} className="btn btn-primary">
                  Register Your Team
                </button>
                <button onClick={onOpenAdmin} className="btn btn-secondary">
                  Open Admin Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              className="leaderboard-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(7, 10, 22, 0.95)',
                    borderBottom: '2px solid rgba(255, 23, 68, 0.35)',
                  }}
                >
                  {/* Rank Column */}
                  <th
                    style={{
                      padding: '16px 20px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      width: '90px',
                      textAlign: 'center',
                    }}
                  >
                    Rank
                  </th>

                  {/* 1. captain_id */}
                  <th
                    style={{
                      padding: '16px 20px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'var(--electric-blue)',
                      textTransform: 'uppercase',
                      width: '150px',
                    }}
                  >
                    Captain ID
                  </th>

                  {/* 2. Team_name */}
                  <th
                    style={{
                      padding: '16px 20px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Team Name
                  </th>

                  {/* 3. round1_score */}
                  <th
                    style={{
                      padding: '16px 20px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      width: '130px',
                    }}
                  >
                    Round 1
                  </th>

                  {/* 4. round2_score */}
                  <th
                    style={{
                      padding: '16px 20px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      width: '130px',
                    }}
                  >
                    Round 2
                  </th>

                  {/* 5. final_points */}
                  <th
                    style={{
                      padding: '16px 24px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      color: 'var(--spider-red)',
                      textTransform: 'uppercase',
                      textAlign: 'right',
                      width: '170px',
                    }}
                  >
                    Final Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => {
                  const rankClass =
                    team.rank === 1
                      ? 'rank-gold'
                      : team.rank === 2
                      ? 'rank-silver'
                      : team.rank === 3
                      ? 'rank-bronze'
                      : '';

                  return (
                    <tr
                      key={team.captain_id}
                      className={rankClass}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}
                    >
                      {/* Rank Indicator */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          {team.rank === 1 && (
                            <Crown size={20} color="var(--gold-accent)" style={{ filter: 'drop-shadow(0 0 6px var(--gold-glow))' }} />
                          )}
                          {team.rank === 2 && (
                            <Shield size={19} color="var(--silver-accent)" style={{ filter: 'drop-shadow(0 0 4px var(--silver-glow))' }} />
                          )}
                          {team.rank === 3 && (
                            <Medal size={19} color="var(--bronze-accent)" style={{ filter: 'drop-shadow(0 0 4px var(--bronze-glow))' }} />
                          )}
                          <span
                            className="rank-num"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 800,
                              fontSize: team.rank <= 3 ? '1.35rem' : '1.1rem',
                              color:
                                team.rank === 1
                                  ? 'var(--gold-accent)'
                                  : team.rank === 2
                                  ? 'var(--silver-accent)'
                                  : team.rank === 3
                                  ? 'var(--bronze-accent)'
                                  : 'var(--text-dim)',
                            }}
                          >
                            {team.rankDisplay}
                          </span>
                        </div>
                        {team.isTie && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--electric-blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-2px' }}>
                            Tied
                          </div>
                        )}
                      </td>

                      {/* 1. Captain ID */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.98rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(0, 229, 255, 0.08)',
                            color: 'var(--electric-blue)',
                            border: '1px solid rgba(0, 229, 255, 0.25)',
                            display: 'inline-block',
                          }}
                        >
                          {team.captain_id}
                        </span>
                      </td>

                      {/* 2. Team Name */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background:
                                team.rank === 1
                                  ? 'linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.1) 100%)'
                                  : 'linear-gradient(135deg, rgba(255,23,68,0.2) 0%, rgba(0,229,255,0.15) 100%)',
                              border: team.rank === 1 ? '1px solid var(--gold-accent)' : '1px solid rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: '#fff',
                            }}
                          >
                            {team.Team_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                color: team.rank === 1 ? '#ffffff' : 'var(--text-main)',
                                letterSpacing: '0.02em',
                              }}
                            >
                              {team.Team_name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                              Official Competitor
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Round 1 Score */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: team.round1_score > 0 ? '#ffffff' : 'var(--text-dim)',
                          }}
                        >
                          {team.round1_score}
                        </span>
                      </td>

                      {/* 4. Round 2 Score */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: team.round2_score > 0 ? '#ffffff' : 'var(--text-dim)',
                          }}
                        >
                          {team.round2_score}
                        </span>
                      </td>

                      {/* 5. Final Points */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div
                          className="points-badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            background:
                              team.rank === 1
                                ? 'linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.08) 100%)'
                                : 'linear-gradient(135deg, rgba(255,23,68,0.2) 0%, rgba(255,23,68,0.05) 100%)',
                            border:
                              team.rank === 1
                                ? '1px solid var(--gold-accent)'
                                : '1px solid rgba(255,23,68,0.4)',
                            boxShadow:
                              team.rank === 1
                                ? '0 0 14px var(--gold-glow)'
                                : '0 0 10px rgba(255,23,68,0.2)',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: '1.35rem',
                              fontWeight: 900,
                              color: team.rank === 1 ? 'var(--gold-accent)' : '#ff1744',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {team.final_points}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--text-dim)',
                              marginLeft: '2px',
                            }}
                          >
                            PTS
                          </span>
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

      {/* Spider-Man Tournament Rule Badge */}
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          background: 'rgba(10, 14, 28, 0.5)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          <span style={{ color: 'var(--electric-blue)', fontWeight: 700 }}>RULESET:</span>
          <span>Final Points = Round 1 + Round 2 automatically computed</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Competition Ranking: Equal scores share ranks (1, 2, 2, 4)
        </div>
      </div>
    </div>
  );
};
