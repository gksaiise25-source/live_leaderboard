import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Team } from '../types/leaderboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if valid Supabase credentials have been provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Local fallback storage key for offline or demo testing
const LOCAL_STORAGE_KEY = 'ace_club_teams_data';
const BROADCAST_CHANNEL_NAME = 'ace_club_realtime_channel';

const INITIAL_SAMPLE_TEAMS: Team[] = [
  {
    captain_id: 'ACE001',
    Team_name: 'Web Warriors',
    round1_score: 0,
    round2_score: 0,
    final_points: 0,
    created_at: new Date().toISOString(),
  },
  {
    captain_id: 'ACE002',
    Team_name: 'Spider Squad',
    round1_score: 0,
    round2_score: 0,
    final_points: 0,
    created_at: new Date().toISOString(),
  },
  {
    captain_id: 'ACE003',
    Team_name: 'Shadow Spiders',
    round1_score: 0,
    round2_score: 0,
    final_points: 0,
    created_at: new Date().toISOString(),
  },
];

// Helper to get local teams
function getLocalTeams(): Team[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TEAMS));
      return INITIAL_SAMPLE_TEAMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_TEAMS;
  } catch {
    return INITIAL_SAMPLE_TEAMS;
  }
}

function saveLocalTeams(teams: Team[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(teams));
  // Broadcast change across tabs and window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ace-teams-updated', { detail: teams }));
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'TEAMS_UPDATED', teams });
      bc.close();
    } catch {
      // BroadcastChannel fallback silently handled
    }
  }
}

// Data service methods
export async function fetchTeams(): Promise<{ data: Team[] | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('final_points', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, checking local fallback:', error.message);
        return { data: null, error: error.message };
      }
      return { data: data as Team[], error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch teams';
      return { data: null, error: msg };
    }
  }

  // Local fallback
  const local = getLocalTeams().sort((a, b) => b.final_points - a.final_points);
  return { data: local, error: null };
}

export async function addTeam(
  captain_id: string,
  Team_name: string
): Promise<{ success: boolean; error: string | null; team?: Team }> {
  const cleanId = captain_id.trim();
  const cleanName = Team_name.trim();

  if (!cleanId || !cleanName) {
    return { success: false, error: 'Captain ID and Team Name are required.' };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            captain_id: cleanId,
            Team_name: cleanName,
            round1_score: 0,
            round2_score: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: `Team with Captain ID "${cleanId}" already exists.` };
        }
        return { success: false, error: error.message };
      }

      return { success: true, error: null, team: data as Team };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error';
      return { success: false, error: msg };
    }
  }

  // Local fallback
  const local = getLocalTeams();
  if (local.some((t) => t.captain_id.toLowerCase() === cleanId.toLowerCase())) {
    return { success: false, error: `Captain ID "${cleanId}" is already taken.` };
  }

  const newTeam: Team = {
    captain_id: cleanId,
    Team_name: cleanName,
    round1_score: 0,
    round2_score: 0,
    final_points: 0,
    created_at: new Date().toISOString(),
  };

  local.push(newTeam);
  saveLocalTeams(local);
  return { success: true, error: null, team: newTeam };
}

export async function updateScores(
  captain_id: string,
  round1_score: number,
  round2_score: number
): Promise<{ success: boolean; error: string | null }> {
  if (round1_score < 0 || round2_score < 0) {
    return { success: false, error: 'Scores cannot be negative.' };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          round1_score,
          round2_score,
        })
        .eq('captain_id', captain_id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error';
      return { success: false, error: msg };
    }
  }

  // Local fallback
  const local = getLocalTeams();
  const index = local.findIndex((t) => t.captain_id === captain_id);
  if (index === -1) {
    return { success: false, error: 'Team not found.' };
  }

  local[index] = {
    ...local[index],
    round1_score,
    round2_score,
    final_points: Number(round1_score) + Number(round2_score),
    updated_at: new Date().toISOString(),
  };

  saveLocalTeams(local);
  return { success: true, error: null };
}

export async function updateTeamInfo(
  original_captain_id: string,
  new_captain_id: string,
  new_team_name: string
): Promise<{ success: boolean; error: string | null }> {
  const cleanId = new_captain_id.trim();
  const cleanName = new_team_name.trim();

  if (!cleanId || !cleanName) {
    return { success: false, error: 'Captain ID and Team Name cannot be empty.' };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          captain_id: cleanId,
          Team_name: cleanName,
        })
        .eq('captain_id', original_captain_id);

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: `Captain ID "${cleanId}" already exists.` };
        }
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database update error';
      return { success: false, error: msg };
    }
  }

  // Local fallback
  const local = getLocalTeams();
  const existingIdx = local.findIndex((t) => t.captain_id === original_captain_id);
  if (existingIdx === -1) {
    return { success: false, error: 'Original team not found.' };
  }

  if (
    cleanId.toLowerCase() !== original_captain_id.toLowerCase() &&
    local.some((t) => t.captain_id.toLowerCase() === cleanId.toLowerCase())
  ) {
    return { success: false, error: `Captain ID "${cleanId}" already in use.` };
  }

  local[existingIdx].captain_id = cleanId;
  local[existingIdx].Team_name = cleanName;
  saveLocalTeams(local);
  return { success: true, error: null };
}

export async function deleteTeam(
  captain_id: string
): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('teams').delete().eq('captain_id', captain_id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error';
      return { success: false, error: msg };
    }
  }

  // Local fallback
  const local = getLocalTeams().filter((t) => t.captain_id !== captain_id);
  saveLocalTeams(local);
  return { success: true, error: null };
}

export async function seedSampleTeams(): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('teams').upsert(INITIAL_SAMPLE_TEAMS, {
        onConflict: 'captain_id',
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Seed error';
      return { success: false, error: msg };
    }
  }

  saveLocalTeams(INITIAL_SAMPLE_TEAMS);
  return { success: true, error: null };
}

export async function resetAllScores(): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('teams').update({ round1_score: 0, round2_score: 0 }).gte('round1_score', 0);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset error';
      return { success: false, error: msg };
    }
  }

  const local = getLocalTeams().map((t) => ({
    ...t,
    round1_score: 0,
    round2_score: 0,
    final_points: 0,
  }));
  saveLocalTeams(local);
  return { success: true, error: null };
}

// Realtime subscription setup
export function subscribeToTeams(onUpdate: () => void): () => void {
  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel('realtime:teams')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Local real-time subscription via window event & broadcast channel
  const handleLocalUpdate = () => onUpdate();
  window.addEventListener('ace-teams-updated', handleLocalUpdate);

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = () => onUpdate();
  } catch {
    // Ignore BroadcastChannel if unsupported
  }

  return () => {
    window.removeEventListener('ace-teams-updated', handleLocalUpdate);
    if (bc) bc.close();
  };
}
