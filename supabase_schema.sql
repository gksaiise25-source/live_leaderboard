-- ==============================================================================
-- ACE CLUB LIVE LEADERBOARD - SUPABASE POSTGRESQL SCHEMA
-- Spider-Man Themed Live Esports Leaderboard
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUIDs (if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing table if recreating (Careful in production)
-- DROP TABLE IF EXISTS teams CASCADE;

-- 3. Create the 'teams' table with exact required column names
CREATE TABLE IF NOT EXISTS teams (
    captain_id TEXT PRIMARY KEY,
    "Team_name" TEXT NOT NULL,
    round1_score NUMERIC NOT NULL DEFAULT 0 CHECK (round1_score >= 0),
    round2_score NUMERIC NOT NULL DEFAULT 0 CHECK (round2_score >= 0),
    final_points NUMERIC GENERATED ALWAYS AS (round1_score + round2_score) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- A. Public read-only access for live leaderboard viewing
DROP POLICY IF EXISTS "Public teams are viewable by everyone" ON teams;
CREATE POLICY "Public teams are viewable by everyone" 
ON teams 
FOR SELECT 
USING (true);

-- B. Authorized organizers can insert new teams
DROP POLICY IF EXISTS "Authenticated users can insert teams" ON teams;
CREATE POLICY "Authenticated users can insert teams" 
ON teams 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- C. Authorized organizers can update team details and scores
DROP POLICY IF EXISTS "Authenticated users can update teams" ON teams;
CREATE POLICY "Authenticated users can update teams" 
ON teams 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- D. Authorized organizers can delete teams
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON teams;
CREATE POLICY "Authenticated users can delete teams" 
ON teams 
FOR DELETE 
TO authenticated
USING (true);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_teams_updated_at ON teams;
CREATE TRIGGER trigger_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Realtime on the 'teams' table
-- Note: In Supabase dashboard, navigate to Database -> Replication -> supabase_realtime
-- or run the following:
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- 8. Optional Initial Sample Teams (initialized to 0, 0, 0)
INSERT INTO teams (captain_id, "Team_name", round1_score, round2_score)
VALUES 
    ('ACE001', 'Web Warriors', 0, 0),
    ('ACE002', 'Spider Squad', 0, 0),
    ('ACE003', 'Shadow Spiders', 0, 0)
ON CONFLICT (captain_id) DO NOTHING;

-- Verification Query:
-- SELECT captain_id, "Team_name", round1_score, round2_score, final_points FROM teams ORDER BY final_points DESC;
