import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Web: avoid `expo-sqlite` (WASM bundle issues in Metro). Same API as native module.
 */
const STORAGE_KEY = 'lumixy_offline_notes_web_v1';

export type OfflineNoteRow = {
  id: number;
  content: string;
  createdAt: number;
};

type StoredShape = {
  notes: OfflineNoteRow[];
};

async function readStore(): Promise<StoredShape> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { notes: [] };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || !('notes' in parsed)) {
      return { notes: [] };
    }
    const notes = (parsed as StoredShape).notes;
    return { notes: Array.isArray(notes) ? notes : [] };
  } catch {
    return { notes: [] };
  }
}

async function writeStore(notes: OfflineNoteRow[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ notes }));
}

export async function listOfflineNotes(): Promise<OfflineNoteRow[]> {
  const { notes } = await readStore();
  return [...notes].sort((left, right) => right.createdAt - left.createdAt);
}

export async function insertOfflineNote(content: string): Promise<number> {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error('النص فارغ.');
  }

  const { notes } = await readStore();
  const nextId = notes.length === 0 ? 1 : Math.max(...notes.map((row) => row.id), 0) + 1;
  const row: OfflineNoteRow = { id: nextId, content: trimmed, createdAt: Date.now() };

  await writeStore([...notes, row]);
  return nextId;
}

export async function deleteOfflineNote(id: number) {
  const { notes } = await readStore();
  await writeStore(notes.filter((row) => row.id !== id));
}
