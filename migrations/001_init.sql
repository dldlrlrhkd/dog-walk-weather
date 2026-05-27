-- Neon Postgres에서 한 번 실행하면 됩니다.
CREATE TABLE IF NOT EXISTS dogs (
  user_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS walk_stamps (
  user_key TEXT NOT NULL,
  year_month TEXT NOT NULL,  -- 형식: '2025-3'
  days INT[] NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_key, year_month)
);
