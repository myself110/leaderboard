import type { Handler } from '@netlify/functions';
import { errorResponse, handleOptions, jsonResponse } from './_shared/http';
import { loadData } from './_shared/storage';

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  const token = event.queryStringParameters?.token;
  if (!token) {
    return errorResponse('Missing token', 400);
  }

  try {
    const data = await loadData(event);
    const player = data.players.find((entry) => entry.token === token);
    if (!player) {
      return errorResponse('Player not found', 404);
    }

    const submissionCount = data.submissions.filter(
      (submission) => submission.playerId === player.id,
    ).length;
    const maxSubmissions = data.settings.maxSubmissionsPerPlayer;
    const group = player.groupId
      ? data.groups.find((entry) => entry.id === player.groupId)
      : null;

    return jsonResponse({
      name: player.name,
      groupName: group?.name ?? null,
      submissionCount,
      maxSubmissions,
      canSubmit: submissionCount < maxSubmissions,
    });
  } catch (error) {
    console.error('player-info error', error);
    return errorResponse('Failed to load player info', 500);
  }
};
