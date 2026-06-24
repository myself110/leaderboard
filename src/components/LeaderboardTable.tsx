import type { SortOrder } from '../../shared/types';
import type { DisplayLeaderboardRow } from '../lib/leaderboardSort';

interface Props {
  rows: DisplayLeaderboardRow[];
  sortOrder: SortOrder;
}

export function LeaderboardTable({ rows, sortOrder }: Props) {
  if (rows.length === 0) {
    return <p className="empty-state">No scores yet. Waiting for submissions…</p>;
  }

  return (
    <div className="leaderboard-table-wrap">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Group</th>
            <th>Best</th>
            <th>Latest</th>
            <th>Attempts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.groupId} className={row.rank <= 3 ? `rank-${row.rank}` : undefined}>
              <td>{row.rank}</td>
              <td>{row.groupName}</td>
              <td>{row.submissionCount > 0 ? row.displayBest : '—'}</td>
              <td>{row.latestScore ?? '—'}</td>
              <td>{row.submissionCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortOrder === 'asc' && (
        <p className="meta sort-hint">Ranked by lowest best score</p>
      )}
    </div>
  );
}
