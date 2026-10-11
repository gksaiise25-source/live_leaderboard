export interface Team {
  captain_id: string;
  Team_name: string;
  round1_score: number;
  round2_score: number;
  final_points: number;
  created_at?: string;
  updated_at?: string;
}

export interface RankedTeam extends Team {
  rank: number;
  rankDisplay: string;
  isTie?: boolean;
}

export interface AdminUser {
  email?: string;
  role: 'admin';
  authenticatedAt: string;
}
