import type { Handler } from '@netlify/functions';
import { verifyAdminToken } from './_shared/auth';
import {
  errorResponse,
  getAuthToken,
  handleOptions,
  jsonResponse,
  parseBody,
} from './_shared/http';
import { loadData, saveData } from './_shared/storage';

interface SettingsBody {
  maxSubmissionsPerPlayer?: number;
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
      return jsonResponse({ settings: data.settings });
    }

    if (event.httpMethod === 'PUT') {
      const body = parseBody<SettingsBody>(event);
      const max = Number(body?.maxSubmissionsPerPlayer);

      if (!Number.isInteger(max) || max < 1 || max > 99) {
        return errorResponse('maxSubmissionsPerPlayer must be between 1 and 99', 400);
      }

      data.settings.maxSubmissionsPerPlayer = max;
      await saveData(data);
      return jsonResponse({ settings: data.settings });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('admin-settings error', error);
    return errorResponse('Failed to manage settings', 500);
  }
};
