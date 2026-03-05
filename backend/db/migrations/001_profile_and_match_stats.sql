CREATE TABLE IF NOT EXISTS player_profile (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_stats (
  profile_id UUID PRIMARY KEY REFERENCES player_profile(id) ON DELETE CASCADE,
  rounds_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  eliminations INTEGER NOT NULL DEFAULT 0,
  bombs_placed INTEGER NOT NULL DEFAULT 0,
  longest_win_streak INTEGER NOT NULL DEFAULT 0,
  best_time_to_win_seconds INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES player_profile(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN ('win', 'lose', 'draw')),
  eliminations INTEGER NOT NULL DEFAULT 0,
  bombs_placed INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_history_profile_created
  ON match_history(profile_id, created_at DESC);
