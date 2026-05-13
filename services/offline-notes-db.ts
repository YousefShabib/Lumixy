import * as SQLite from 'expo-sqlite';

const DB_NAME = 'lumixy_offline.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (database) => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS offline_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
      `);
      return database;
    });
  }

  return dbPromise;
}

export type OfflineNoteRow = {
  id: number;
  content: string;
  createdAt: number;
};

export async function listOfflineNotes(): Promise<OfflineNoteRow[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ id: number; content: string; created_at: number }>(
    'SELECT id, content, created_at FROM offline_notes ORDER BY created_at DESC'
  );

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function insertOfflineNote(content: string): Promise<number> {
  const database = await getDb();
  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error('النص فارغ.');
  }

  const result = await database.runAsync(
    'INSERT INTO offline_notes (content, created_at) VALUES (?, ?)',
    [trimmed, Date.now()]
  );

  return Number(result.lastInsertRowId);
}

export async function deleteOfflineNote(id: number) {
  const database = await getDb();
  await database.runAsync('DELETE FROM offline_notes WHERE id = ?', [id]);
}
