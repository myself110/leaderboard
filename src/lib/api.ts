const API_BASE = '/.netlify/functions';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error ?? 'Request failed');
    }
    throw new Error(await response.text());
  }

  if (contentType.includes('text/csv')) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  getLeaderboard: () => request<import('../../shared/types').LeaderboardResponse>('/leaderboard'),

  getGroupInfo: (token: string) =>
    request<import('../../shared/types').GroupPublicInfo>(`/player-info?token=${encodeURIComponent(token)}`),

  submitScore: (token: string, score: number) =>
    request<{ ok: boolean; submissionCount: number; maxSubmissions: number }>('/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, score }),
    }),

  adminLogin: (password: string) =>
    request<import('../../shared/types').AdminLoginResponse>('/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),

  getAdminGroups: (token: string) =>
    request<{ groups: import('../../shared/types').Group[] }>('/admin-groups', {
      headers: authHeaders(token),
    }),

  addGroup: (token: string, name: string) =>
    request<{ group: import('../../shared/types').Group }>('/admin-groups', {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),

  deleteGroup: (token: string, id: string) =>
    request<{ ok: boolean }>(`/admin-groups?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getSettings: (token: string) =>
    request<{ settings: import('../../shared/types').Settings }>('/admin-settings', {
      headers: authHeaders(token),
    }),

  updateSettings: (token: string, maxSubmissionsPerPlayer: number) =>
    request<{ settings: import('../../shared/types').Settings }>('/admin-settings', {
      method: 'PUT',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxSubmissionsPerPlayer }),
    }),

  exportCsv: (token: string) =>
    request<string>('/admin-export', {
      headers: authHeaders(token),
    }),

  importCsv: (token: string, csv: string) =>
    request<{ ok: boolean; imported: number }>('/admin-import', {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'text/csv' },
      body: csv,
    }),

  resetScores: (token: string) =>
    request<{ ok: boolean; cleared: number }>('/admin-reset-scores', {
      method: 'POST',
      headers: authHeaders(token),
    }),
};

export function submitUrl(token: string): string {
  return `${window.location.origin}/s/${token}`;
}
