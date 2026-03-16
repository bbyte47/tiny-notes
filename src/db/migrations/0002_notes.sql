CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_json TEXT NOT NULL,
  is_shared INTEGER NOT NULL DEFAULT 0,
  share_token TEXT,
  shared_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (owner_user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_owner_updated
  ON notes (owner_user_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_share_token_unique
  ON notes (share_token);
