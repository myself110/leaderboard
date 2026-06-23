import type { Handler, HandlerEvent } from '@netlify/functions';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200): ReturnType<Handler> {
  return {
    statusCode: status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(message: string, status = 400): ReturnType<Handler> {
  return jsonResponse({ error: message }, status);
}

export function handleOptions(event: HandlerEvent): ReturnType<Handler> | null {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  return null;
}

export function parseBody<T>(event: HandlerEvent): T | null {
  if (!event.body) return null;
  try {
    return JSON.parse(event.body) as T;
  } catch {
    return null;
  }
}

export function getAuthToken(event: HandlerEvent): string | null {
  const header = event.headers.authorization ?? event.headers.Authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}
