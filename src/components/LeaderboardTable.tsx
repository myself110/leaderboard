import type { LeaderboardRow } from '../../shared/types';

interface Props {
  rows: LeaderboardRow[];
}

export function LeaderboardTable({ rows }: Props) {
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
              <td>{row.bestScore}</td>
              <td>{row.latestScore ?? '—'}</td>
              <td>{row.submissionCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
