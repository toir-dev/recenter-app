import type { SQLiteDatabase } from 'expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';

import { migrations } from './migrations';

const DATABASE_NAME = 'recenter.db';

const boolToInt = (value?: boolean) => (value ? 1 : 0);
const now = () => Date.now();
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;

type Nullable<T> = T | null;

let databasePromise: Nullable<Promise<SQLiteDatabase>> = null;
let migrationsPromise: Nullable<Promise<void>> = null;

async function ensureDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      return db;
    })();
  }

  const db = await databasePromise;

  if (!migrationsPromise) {
    migrationsPromise = runMigrationsInternal(db);
  }

  await migrationsPromise;
  return db;
}

async function runMigrationsInternal(db: SQLiteDatabase) {
  await db.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY)');
  const appliedRows = await db.getAllAsync<{ id: number }>('SELECT id FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.id));

  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      continue;
    }

    await db.execAsync('BEGIN TRANSACTION');
    try {
      for (const statement of migration.statements) {
        await db.execAsync(statement);
      }
      await db.runAsync('INSERT INTO schema_migrations (id) VALUES (?)', migration.id);
      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  }
}

export async function runMigrations() {
  await ensureDatabase();
}

export async function closeDatabase() {
  if (!databasePromise) {
    return;
  }

  try {
    const db = await databasePromise;
    await db.closeAsync();
  } catch (error) {
    console.warn('[sqlite] Failed to close database', error);
  } finally {
    databasePromise = null;
    migrationsPromise = null;
  }
}

export type UserPreference = {
  id?: number;
  userId: string;
  key: string;
  value: string;
  synced?: boolean;
  updatedAt?: number;
};

export async function saveUserPreference(pref: UserPreference) {
  const db = await ensureDatabase();
  const timestamp = pref.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO user_prefs (user_id, pref_key, pref_value, synced, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, pref_key) DO UPDATE SET pref_value=excluded.pref_value, synced=excluded.synced, updated_at=excluded.updated_at`,
    pref.userId,
    pref.key,
    pref.value,
    boolToInt(pref.synced),
    timestamp
  );
}

export async function listUserPreferences(userId?: string) {
  const db = await ensureDatabase();
  if (userId) {
    return db.getAllAsync('SELECT * FROM user_prefs WHERE user_id = ? ORDER BY updated_at DESC', userId);
  }
  return db.getAllAsync('SELECT * FROM user_prefs ORDER BY updated_at DESC');
}

export type CheckIn = {
  id?: string;
  userId: string;
  occurredAt?: number;
  mood?: string;
  note?: string;
  synced?: boolean;
  updatedAt?: number;
};

export async function saveCheckIn(checkIn: CheckIn) {
  const db = await ensureDatabase();
  const id = checkIn.id ?? generateId('checkin');
  const occurredAt = checkIn.occurredAt ?? now();
  const updatedAt = checkIn.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO checkins (id, user_id, occurred_at, mood, note, synced, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id, occurred_at=excluded.occurred_at, mood=excluded.mood, note=excluded.note, synced=excluded.synced, updated_at=excluded.updated_at`,
    id,
    checkIn.userId,
    occurredAt,
    checkIn.mood ?? null,
    checkIn.note ?? null,
    boolToInt(checkIn.synced),
    updatedAt
  );
  return id;
}

export async function listCheckIns(userId?: string) {
  const db = await ensureDatabase();
  if (userId) {
    return db.getAllAsync('SELECT * FROM checkins WHERE user_id = ? ORDER BY occurred_at DESC', userId);
  }
  return db.getAllAsync('SELECT * FROM checkins ORDER BY occurred_at DESC');
}

export type SessionRecord = {
  id?: string;
  userId: string;
  startedAt?: number;
  endedAt?: number | null;
  sessionType?: string;
  metadata?: string | Record<string, unknown> | null;
  synced?: boolean;
  updatedAt?: number;
};

export async function saveSession(session: SessionRecord) {
  const db = await ensureDatabase();
  const id = session.id ?? generateId('session');
  const updatedAt = session.updatedAt ?? now();
  const metadataString =
    typeof session.metadata === 'string' || session.metadata == null
      ? session.metadata ?? null
      : JSON.stringify(session.metadata);
  await db.runAsync(
    `INSERT INTO sessions (id, user_id, started_at, ended_at, session_type, metadata, synced, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id, started_at=excluded.started_at, ended_at=excluded.ended_at, session_type=excluded.session_type, metadata=excluded.metadata, synced=excluded.synced, updated_at=excluded.updated_at`,
    id,
    session.userId,
    session.startedAt ?? null,
    session.endedAt ?? null,
    session.sessionType ?? null,
    metadataString,
    boolToInt(session.synced),
    updatedAt
  );
  return id;
}

export async function listSessions(userId?: string) {
  const db = await ensureDatabase();
  if (userId) {
    return db.getAllAsync('SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC', userId);
  }
  return db.getAllAsync('SELECT * FROM sessions ORDER BY started_at DESC');
}

export type JournalEntry = {
  id?: string;
  userId: string;
  entry: string;
  mood?: string;
  createdAt?: number;
  synced?: boolean;
  updatedAt?: number;
};

export async function saveJournalEntry(entry: JournalEntry) {
  const db = await ensureDatabase();
  const id = entry.id ?? generateId('journal');
  const createdAt = entry.createdAt ?? now();
  const updatedAt = entry.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO journal_entries (id, user_id, entry, mood, created_at, synced, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id, entry=excluded.entry, mood=excluded.mood, synced=excluded.synced, updated_at=excluded.updated_at`,
    id,
    entry.userId,
    entry.entry,
    entry.mood ?? null,
    createdAt,
    boolToInt(entry.synced),
    updatedAt
  );
  return id;
}

export async function listJournalEntries(userId?: string) {
  const db = await ensureDatabase();
  if (userId) {
    return db.getAllAsync('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC', userId);
  }
  return db.getAllAsync('SELECT * FROM journal_entries ORDER BY created_at DESC');
}

export type ContentCacheRecord = {
  id?: string;
  slug: string;
  payload: unknown;
  synced?: boolean;
  updatedAt?: number;
};

export async function saveContentCache(record: ContentCacheRecord) {
  const db = await ensureDatabase();
  const id = record.id ?? generateId('cache');
  const payloadString = typeof record.payload === 'string' ? record.payload : JSON.stringify(record.payload);
  const updatedAt = record.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO content_cache (id, slug, payload, synced, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET id=excluded.id, payload=excluded.payload, synced=excluded.synced, updated_at=excluded.updated_at`,
    id,
    record.slug,
    payloadString,
    boolToInt(record.synced ?? true),
    updatedAt
  );
  return id;
}

export async function getContentCache(slug: string) {
  const db = await ensureDatabase();
  const row = await db.getFirstAsync<{ id: string; slug: string; payload: string; synced: number; updated_at: number }>(
    'SELECT * FROM content_cache WHERE slug = ? LIMIT 1',
    slug
  );
  if (!row) {
    return null;
  }
  let parsed: unknown = row.payload;
  try {
    parsed = JSON.parse(row.payload);
  } catch {
    parsed = row.payload;
  }
  return { ...row, payload: parsed };
}

export type StreakRecord = {
  id?: string;
  userId: string;
  kind: string;
  count?: number;
  active?: boolean;
  synced?: boolean;
  updatedAt?: number;
};

export async function saveStreak(streak: StreakRecord) {
  const db = await ensureDatabase();
  const id = streak.id ?? generateId('streak');
  const updatedAt = streak.updatedAt ?? now();
  const activeInt = (streak.active ?? true) ? 1 : 0;
  await db.runAsync(
    `INSERT INTO streaks (id, user_id, kind, count, active, synced, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, kind) DO UPDATE SET id=excluded.id, count=excluded.count, active=excluded.active, synced=excluded.synced, updated_at=excluded.updated_at`,
    id,
    streak.userId,
    streak.kind,
    streak.count ?? 0,
    activeInt,
    boolToInt(streak.synced),
    updatedAt
  );
  return id;
}

export async function listStreaks(userId?: string) {
  const db = await ensureDatabase();
  if (userId) {
    return db.getAllAsync('SELECT * FROM streaks WHERE user_id = ? ORDER BY updated_at DESC', userId);
  }
  return db.getAllAsync('SELECT * FROM streaks ORDER BY updated_at DESC');
}

async function markSynced(table: string, ids: string[], synced = true) {
  if (ids.length === 0) {
    return;
  }
  const db = await ensureDatabase();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE ${table} SET synced = ?, updated_at = ? WHERE id IN (${placeholders})`,
    boolToInt(synced),
    now(),
    ...ids
  );
}

export const markCheckInsSynced = (ids: string[], synced = true) => markSynced('checkins', ids, synced);
export const markJournalEntriesSynced = (ids: string[], synced = true) => markSynced('journal_entries', ids, synced);
export const markSessionsSynced = (ids: string[], synced = true) => markSynced('sessions', ids, synced);
export const markStreaksSynced = (ids: string[], synced = true) => markSynced('streaks', ids, synced);

export async function clearAllTables() {
  const db = await ensureDatabase();
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.execAsync('DELETE FROM user_prefs');
    await db.execAsync('DELETE FROM checkins');
    await db.execAsync('DELETE FROM sessions');
    await db.execAsync('DELETE FROM journal_entries');
    await db.execAsync('DELETE FROM content_cache');
    await db.execAsync('DELETE FROM streaks');
    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

export async function runSqliteSmokeTest() {
  await clearAllTables();

  await saveUserPreference({ userId: 'smoke-user', key: 'test_pref', value: 'on' });
  const prefs = await listUserPreferences('smoke-user');
  if (!prefs.length) {
    throw new Error('user_prefs insert/select failed');
  }

  const checkinId = await saveCheckIn({ userId: 'smoke-user', mood: 'calm', note: 'smoke' });
  const checkins = await listCheckIns('smoke-user');
  if (!checkins.length) {
    throw new Error('checkins insert/select failed');
  }
  await markCheckInsSynced([checkinId]);

  const journalId = await saveJournalEntry({ userId: 'smoke-user', entry: 'hello world', mood: 'neutral' });
  const journals = await listJournalEntries('smoke-user');
  if (!journals.length) {
    throw new Error('journal_entries insert/select failed');
  }
  await markJournalEntriesSynced([journalId]);

  await saveSession({ userId: 'smoke-user', sessionType: 'breath', startedAt: now(), endedAt: now() + 1000 });
  const sessions = await listSessions('smoke-user');
  if (!sessions.length) {
    throw new Error('sessions insert/select failed');
  }

  await saveContentCache({ slug: 'smoke-test', payload: { hello: 'world' }, synced: true });
  const cache = await getContentCache('smoke-test');
  if (!cache) {
    throw new Error('content_cache insert/select failed');
  }

  await saveStreak({ userId: 'smoke-user', kind: 'login', count: 3 });
  const streaks = await listStreaks('smoke-user');
  if (!streaks.length) {
    throw new Error('streaks insert/select failed');
  }

  console.info('[sqlite] Smoke tests passed.');
}

export async function getDatabase() {
  return ensureDatabase();
}
