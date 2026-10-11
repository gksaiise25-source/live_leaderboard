import type { Team, RankedTeam } from '../types/leaderboard';

/**
 * Computes competition ranking for an array of teams.
 * Rules:
 * 1. Teams are sorted primarily by final_points in descending order.
 * 2. In competition ranking (1224 style):
 *    - The top team has rank 1.
 *    - If team[i] has the same final_points as team[i-1], it gets the same rank as team[i-1].
 *    - Otherwise, its rank is i + 1 (its position in the list).
 */
export function calculateCompetitionRanking(teams: Team[]): RankedTeam[] {
  if (!teams || teams.length === 0) return [];

  // Sort descending by final_points, then alphabetically by team name if tied
  const sorted = [...teams].sort((a, b) => {
    if (b.final_points !== a.final_points) {
      return b.final_points - a.final_points;
    }
    return a.Team_name.localeCompare(b.Team_name);
  });

  const ranked: RankedTeam[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    if (i === 0) {
      ranked.push({
        ...current,
        rank: 1,
        rankDisplay: '#1',
        isTie: false,
      });
      continue;
    }

    const prev = ranked[i - 1];

    if (current.final_points === prev.final_points) {
      // Tied with previous team
      ranked.push({
        ...current,
        rank: prev.rank,
        rankDisplay: `#${prev.rank}`,
        isTie: true,
      });
      // Mark the predecessor as tied too
      prev.isTie = true;
    } else {
      // Standard competition ranking skips to position i + 1
      const currentRank = i + 1;
      ranked.push({
        ...current,
        rank: currentRank,
        rankDisplay: `#${currentRank}`,
        isTie: false,
      });
    }
  }

  return ranked;
}

export function getRankTier(rank: number): 'gold' | 'silver' | 'bronze' | 'standard' {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'standard';
}
