import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getStore } from '@netlify/blobs';
import type { AppData } from '../../../shared/types';

const STORE_NAME = 'leaderboard';
const BLOB_KEY = 'data';

export const DEFAULT_DATA: AppData = {
  groups: [],
  players: [],
  submissions: [],
  settings: { maxSubmissionsPerPlayer: 3 },
};

function localDataPath(): string {
  return path.join(process.cwd(), '.local-data', 'data.json');
}

async function readLocalData(): Promise<AppData> {
  try {
    const raw = await fs.readFile(localDataPath(), 'utf8');
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

async function writeLocalData(data: AppData): Promise<void> {
  const filePath = localDataPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function useLocalStorage(): boolean {
  return Boolean(process.env.NETLIFY_DEV || process.env.USE_LOCAL_DATA === 'true');
}

export async function loadData(): Promise<AppData> {
  if (useLocalStorage()) {
    return readLocalData();
  }

  try {
    const store = getStore(STORE_NAME);
    const data = await store.get(BLOB_KEY, { type: 'json' });
    if (!data) return structuredClone(DEFAULT_DATA);
    return { ...DEFAULT_DATA, ...(data as AppData) };
  } catch {
    return readLocalData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  if (useLocalStorage()) {
    await writeLocalData(data);
    return;
  }

  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(BLOB_KEY, data);
  } catch {
    await writeLocalData(data);
  }
}

export function newId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export function newToken(): string {
  return crypto.randomBytes(16).toString('hex');
}
