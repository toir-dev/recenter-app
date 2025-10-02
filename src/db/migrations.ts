export type Migration = {
  id: number;
  description: string;
  statements: string[];
};

export const migrations: Migration[] = [
  {
    id: 1,
    description: 'Initial schema for user data and cached content',
    statements: [
      `CREATE TABLE IF NOT EXISTS schema_migrations (
          id INTEGER PRIMARY KEY
        );`,
      `CREATE TABLE IF NOT EXISTS user_prefs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          pref_key TEXT NOT NULL,
          pref_value TEXT,
          synced INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL,
          UNIQUE(user_id, pref_key)
        );`,
      `CREATE TABLE IF NOT EXISTS checkins (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          occurred_at INTEGER NOT NULL,
          mood TEXT,
          note TEXT,
          synced INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL
        );`,
      `CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          started_at INTEGER,
          ended_at INTEGER,
          session_type TEXT,
          metadata TEXT,
          synced INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL
        );`,
      `CREATE TABLE IF NOT EXISTS journal_entries (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          entry TEXT NOT NULL,
          mood TEXT,
          created_at INTEGER NOT NULL,
          synced INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL
        );`,
      `CREATE TABLE IF NOT EXISTS content_cache (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          payload TEXT NOT NULL,
          synced INTEGER NOT NULL DEFAULT 1,
          updated_at INTEGER NOT NULL
        );`,
      `CREATE TABLE IF NOT EXISTS streaks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 0,
          active INTEGER NOT NULL DEFAULT 1,
          synced INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL,
          UNIQUE(user_id, kind)
        );`,
      `CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON user_prefs(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);`
    ],
  },
];
