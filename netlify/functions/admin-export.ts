import type { Handler } from '@netlify/functions';
import { verifyAdminToken } from './_shared/auth';
import { toCsv } from './_shared/leaderboard';
import { corsHeaders, errorResponse, getAuthToken, handleOptions } from './_shared/http';
import { loadData } from './_shared/storage';

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  const token = getAuthToken(event);
  if (!verifyAdminToken(token)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const data = await loadData(event);
    const csv = toCsv(data);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leaderboard.csv"',
      },
      body: csv,
    };
  } catch (error) {
    console.error('admin-export error', error);
    return errorResponse('Failed to export data', 500);
  }
};
