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

interface GroupBody {
  name?: string;
}

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  const token = getAuthToken(event);
  if (!verifyAdminToken(token)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const data = await loadData(event);

    if (event.httpMethod === 'GET') {
      return jsonResponse({ groups: data.players });
    }

    if (event.httpMethod === 'POST') {
      const body = parseBody<GroupBody>(event);
      const name = body?.name?.trim();
      if (!name) {
        return errorResponse('Name is required', 400);
      }

      const group = {
        id: newId(),
        name,
        token: newToken(),
        createdAt: new Date().toISOString(),
      };

      data.players.push(group);
      await saveData(data, event);
      return jsonResponse({ group }, 201);
    }

    if (event.httpMethod === 'DELETE') {
      const groupId = event.queryStringParameters?.id;
      if (!groupId) {
        return errorResponse('Missing group id', 400);
      }

      data.players = data.players.filter((group) => group.id !== groupId);
      data.submissions = data.submissions.filter(
        (submission) => submission.playerId !== groupId,
      );
      await saveData(data, event);
      return jsonResponse({ ok: true });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('admin-groups error', error);
    return errorResponse('Failed to manage groups', 500);
  }
};
