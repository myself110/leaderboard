import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { connectLambda, getStore } from '@netlify/blobs';
import type { HandlerEvent } from '@netlify/functions';
import type { AppData } from '../../../shared/types';

const STORE_NAME = 'leaderboard';
const BLOB_KEY = 'data';

export const DEFAULT_DATA: AppData = {
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
    const parsed = JSON.parse(raw) as AppData;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      players: parsed.players ?? [],
    };
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

function getBlobStore(event?: HandlerEvent) {
  if (event) {
    connectLambda(event);
  }
  return getStore(STORE_NAME);
}

export async function loadData(event?: HandlerEvent): Promise<AppData> {
  if (useLocalStorage()) {
    return readLocalData();
  }

  try {
    const store = getBlobStore(event);
    const data = await store.get(BLOB_KEY, { type: 'json' });
    if (!data) return structuredClone(DEFAULT_DATA);
    const parsed = data as AppData;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      players: parsed.players ?? [],
    };
  } catch (error) {
    console.error('Failed to load from Netlify Blobs', error);
    return structuredClone(DEFAULT_DATA);
  }
}

export async function saveData(data: AppData, event?: HandlerEvent): Promise<void> {
  if (useLocalStorage()) {
    await writeLocalData(data);
    return;
  }

  const store = getBlobStore(event);
  await store.setJSON(BLOB_KEY, data);
}

export function newId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export function newToken(): string {
  return crypto.randomBytes(16).toString('hex');
}
