import type { AppData, LeaderboardRow } from '../../../shared/types';

export function buildLeaderboard(data: AppData): LeaderboardRow[] {
  const groupById = new Map(data.groups.map((group) => [group.id, group.name]));
  const submissionsByPlayer = new Map<string, typeof data.submissions>();

  for (const submission of data.submissions) {
    const list = submissionsByPlayer.get(submission.playerId) ?? [];
    list.push(submission);
    submissionsByPlayer.set(submission.playerId, list);
  }

  const rows: LeaderboardRow[] = data.players.map((player) => {
    const playerSubmissions = submissionsByPlayer.get(player.id) ?? [];
    const sorted = [...playerSubmissions].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
    const bestScore =
      playerSubmissions.length > 0
        ? Math.max(...playerSubmissions.map((submission) => submission.score))
        : 0;

    return {
      rank: 0,
      playerId: player.id,
      playerName: player.name,
      groupName: player.groupId ? (groupById.get(player.groupId) ?? null) : null,
      bestScore,
      latestScore: sorted[0]?.score ?? null,
      submissionCount: playerSubmissions.length,
    };
  });

  rows.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.submissionCount !== a.submissionCount) return b.submissionCount - a.submissionCount;
    return a.playerName.localeCompare(b.playerName);
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(data: AppData): string {
  const rows = buildLeaderboard(data);
  const header = 'rank,player,group,best_score,latest_score,submissions';
  const lines = rows.map((row) =>
    [
      row.rank,
      escapeCsv(row.playerName),
      escapeCsv(row.groupName ?? ''),
      row.bestScore,
      row.latestScore ?? '',
      row.submissionCount,
    ].join(','),
  );
  return [header, ...lines].join('\n');
}
