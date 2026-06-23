import crypto from 'node:crypto';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }
  return secret;
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function createAdminToken(): string {
  const payload = {
    role: 'admin',
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;

  const [data, sig] = token.split('.');
  if (!data || !sig) return false;

  try {
    const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
    if (sig !== expected) return false;

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };

    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}
