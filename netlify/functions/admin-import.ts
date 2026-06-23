import type { Handler } from '@netlify/functions';
import { verifyAdminToken } from './_shared/auth';
import { errorResponse, getAuthToken, handleOptions, jsonResponse } from './_shared/http';
import { loadData, newId, newToken, saveData } from './_shared/storage';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(current);
      current = '';
    } else if (char === '\n') {
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
    } else if (char !== '\r') {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((cell) => cell.trim().length > 0));
}

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const token = getAuthToken(event);
  if (!verifyAdminToken(token)) {
    return errorResponse('Unauthorized', 401);
  }

  if (!event.body) {
    return errorResponse('Missing CSV body', 400);
  }

  try {
    const rows = parseCsv(event.body);
    if (rows.length < 2) {
      return errorResponse('CSV must include a header row and at least one player', 400);
    }

    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const nameIndex = header.indexOf('name');
    const groupIndex = header.indexOf('group');

    if (nameIndex === -1) {
      return errorResponse('CSV must include a "name" column', 400);
    }

    const data = await loadData(event);
    let imported = 0;

    for (const row of rows.slice(1)) {
      const name = row[nameIndex]?.trim();
      if (!name) continue;

      const groupName = groupIndex >= 0 ? row[groupIndex]?.trim() : '';
      let groupId: string | null = null;

      if (groupName) {
        let group = data.groups.find((entry) => entry.name.toLowerCase() === groupName.toLowerCase());
        if (!group) {
          group = {
            id: newId(),
            name: groupName,
            createdAt: new Date().toISOString(),
          };
          data.groups.push(group);
        }
        groupId = group.id;
      }

      data.players.push({
        id: newId(),
        name,
        token: newToken(),
        groupId,
        createdAt: new Date().toISOString(),
      });
      imported += 1;
    }

    if (imported === 0) {
      return errorResponse('No valid players found in CSV', 400);
    }

    await saveData(data, event);
    return jsonResponse({ ok: true, imported });
  } catch (error) {
    console.error('admin-import error', error);
    return errorResponse('Failed to import CSV', 500);
  }
};
