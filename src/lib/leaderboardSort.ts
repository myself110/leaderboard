import type { LeaderboardRow, SortOrder } from '../../shared/types';

export interface DisplayLeaderboardRow extends LeaderboardRow {
  displayBest: number;
}

export function sortLeaderboardRows(
  rows: LeaderboardRow[],
  order: SortOrder,
): DisplayLeaderboardRow[] {
  const sorted = [...rows].sort((a, b) => {
    const scoreA = order === 'desc' ? a.bestScore : a.lowestScore;
    const scoreB = order === 'desc' ? b.bestScore : b.lowestScore;

    if (order === 'desc') {
      if (scoreB !== scoreA) return scoreB - scoreA;
      if (b.submissionCount !== a.submissionCount) return b.submissionCount - a.submissionCount;
    } else {
      const aHasScore = a.submissionCount > 0;
      const bHasScore = b.submissionCount > 0;
      if (aHasScore !== bHasScore) return aHasScore ? -1 : 1;
      if (aHasScore && scoreA !== scoreB) return scoreA - scoreB;
      if (b.submissionCount !== a.submissionCount) return b.submissionCount - a.submissionCount;
    }

    return a.groupName.localeCompare(b.groupName);
  });

  return sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
    displayBest: order === 'desc' ? row.bestScore : row.lowestScore,
  }));
}
