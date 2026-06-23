import type { Handler } from '@netlify/functions';
import { verifyAdminToken } from './_shared/auth';
import {
  errorResponse,
  getAuthToken,
  handleOptions,
  jsonResponse,
  parseBody,
} from './_shared/http';
import { loadData, newId, newToken, saveData } from './_shared/storage';

interface PlayerBody {
  name?: string;
  groupId?: string | null;
}

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  const token = getAuthToken(event);
  if (!verifyAdminToken(token)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const data = await loadData();

    if (event.httpMethod === 'GET') {
      return jsonResponse({ players: data.players, groups: data.groups });
    }

    if (event.httpMethod === 'POST') {
      const body = parseBody<PlayerBody>(event);
      const name = body?.name?.trim();
      if (!name) {
        return errorResponse('Name is required', 400);
      }

      const player = {
        id: newId(),
        name,
        token: newToken(),
        groupId: body?.groupId ?? null,
        createdAt: new Date().toISOString(),
      };

      data.players.push(player);
      await saveData(data);
      return jsonResponse({ player }, 201);
    }

    if (event.httpMethod === 'DELETE') {
      const playerId = event.queryStringParameters?.id;
      if (!playerId) {
        return errorResponse('Missing player id', 400);
      }

      data.players = data.players.filter((player) => player.id !== playerId);
      data.submissions = data.submissions.filter(
        (submission) => submission.playerId !== playerId,
      );
      await saveData(data);
      return jsonResponse({ ok: true });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('admin-players error', error);
    return errorResponse('Failed to manage players', 500);
  }
};
