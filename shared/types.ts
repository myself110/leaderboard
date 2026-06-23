export interface Group {
  id: string;
  name: string;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  token: string;
  groupId: string | null;
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
  groups: Group[];
  players: Player[];
  submissions: Submission[];
  settings: Settings;
}

export interface LeaderboardRow {
  rank: number;
  playerId: string;
  playerName: string;
  groupName: string | null;
  bestScore: number;
  latestScore: number | null;
  submissionCount: number;
}

export interface LeaderboardResponse {
  rows: LeaderboardRow[];
  updatedAt: string;
  maxSubmissionsPerPlayer: number;
}

export interface PlayerPublicInfo {
  name: string;
  groupName: string | null;
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
