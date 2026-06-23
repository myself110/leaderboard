import type { AppData, LeaderboardRow } from '../../../shared/types';

export function buildLeaderboard(data: AppData): LeaderboardRow[] {
  const submissionsByGroup = new Map<string, typeof data.submissions>();

  for (const submission of data.submissions) {
    const list = submissionsByGroup.get(submission.playerId) ?? [];
    list.push(submission);
    submissionsByGroup.set(submission.playerId, list);
  }

  const rows: LeaderboardRow[] = data.players.map((group) => {
    const groupSubmissions = submissionsByGroup.get(group.id) ?? [];
    const sorted = [...groupSubmissions].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
    const bestScore =
      groupSubmissions.length > 0
        ? Math.max(...groupSubmissions.map((submission) => submission.score))
        : 0;

    return {
      rank: 0,
      groupId: group.id,
      groupName: group.name,
      bestScore,
      latestScore: sorted[0]?.score ?? null,
      submissionCount: groupSubmissions.length,
    };
  });

  rows.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.submissionCount !== a.submissionCount) return b.submissionCount - a.submissionCount;
    return a.groupName.localeCompare(b.groupName);
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
  const header = 'rank,group,best_score,latest_score,submissions';
  const lines = rows.map((row) =>
    [
      row.rank,
      escapeCsv(row.groupName),
      row.bestScore,
      row.latestScore ?? '',
      row.submissionCount,
    ].join(','),
  );
  return [header, ...lines].join('\n');
}
