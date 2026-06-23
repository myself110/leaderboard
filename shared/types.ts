export interface Group {
  id: string;
  name: string;
  token: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  playerId: string;
  score: number;
  submittedAt: string;
}

export interface Settings {
  maxSubmissionsPerPlayer: number;
}

export interface AppData {
  /** @deprecated Legacy field — ignored on read */
  groups?: { id: string; name: string; createdAt: string }[];
  players: Group[];
  submissions: Submission[];
  settings: Settings;
}

export interface LeaderboardRow {
  rank: number;
  groupId: string;
  groupName: string;
  bestScore: number;
  latestScore: number | null;
  submissionCount: number;
}

export interface LeaderboardResponse {
  rows: LeaderboardRow[];
  updatedAt: string;
  maxSubmissionsPerPlayer: number;
}

export interface GroupPublicInfo {
  name: string;
  submissionCount: number;
  maxSubmissions: number;
  canSubmit: boolean;
}

export interface AdminLoginResponse {
  ok: boolean;
  token?: string;
}

export interface ApiError {
  error: string;
}
