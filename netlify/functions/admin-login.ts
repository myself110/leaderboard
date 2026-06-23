import type { Handler } from '@netlify/functions';
import { createAdminToken, verifyPassword } from './_shared/auth';
import { errorResponse, handleOptions, jsonResponse, parseBody } from './_shared/http';

interface LoginBody {
  password?: string;
}

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const body = parseBody<LoginBody>(event);
  if (!body?.password) {
    return errorResponse('Missing password', 400);
  }

  if (!verifyPassword(body.password)) {
    return errorResponse('Invalid password', 401);
  }

  return jsonResponse({ ok: true, token: createAdminToken() });
};
