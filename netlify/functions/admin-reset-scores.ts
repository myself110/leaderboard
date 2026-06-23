import type { Handler } from '@netlify/functions';
import { verifyAdminToken } from './_shared/auth';
import { errorResponse, getAuthToken, handleOptions, jsonResponse } from './_shared/http';
import { loadData, saveData } from './_shared/storage';

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

  try {
    const data = await loadData(event);
    const cleared = data.submissions.length;
    data.submissions = [];
    await saveData(data, event);
    return jsonResponse({ ok: true, cleared });
  } catch (error) {
    console.error('admin-reset-scores error', error);
    return errorResponse('Failed to reset scores', 500);
  }
};
