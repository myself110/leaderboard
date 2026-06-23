import type { Handler } from '@netlify/functions';
import { buildLeaderboard } from './_shared/leaderboard';
import { errorResponse, handleOptions, jsonResponse } from './_shared/http';
import { loadData } from './_shared/storage';

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const data = await loadData(event);
    const rows = buildLeaderboard(data);

    return jsonResponse({
      rows,
      updatedAt: new Date().toISOString(),
      maxSubmissionsPerPlayer: data.settings.maxSubmissionsPerPlayer,
    });
  } catch (error) {
    console.error('leaderboard error', error);
    return errorResponse('Failed to load leaderboard', 500);
  }
};
