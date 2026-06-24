import { useMemo, useState } from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { sortLeaderboardRows } from '../lib/leaderboardSort';
import type { SortOrder } from '../../shared/types';

export function LeaderboardPage() {
  const { data, error, loading } = useLeaderboard();
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const rows = useMemo(
    () => (data ? sortLeaderboardRows(data.rows, sortOrder) : []),
    [data, sortOrder],
  );

  return (
    <main className="page leaderboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Live event</p>
          <h1>Leaderboard</h1>
        </div>
        <div className="leaderboard-header-actions">
          <div className="sort-toggle" role="group" aria-label="Sort order">
            <button
              type="button"
              className={sortOrder === 'desc' ? 'sort-btn active' : 'sort-btn'}
              onClick={() => setSortOrder('desc')}
            >
              Highest first
            </button>
            <button
              type="button"
              className={sortOrder === 'asc' ? 'sort-btn active' : 'sort-btn'}
              onClick={() => setSortOrder('asc')}
            >
              Lowest first
            </button>
          </div>
          {data && (
            <p className="meta">
              Max {data.maxSubmissionsPerPlayer} submissions per group · Updated{' '}
              {new Date(data.updatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </header>

      {loading && !data && <p className="status">Loading scores…</p>}
      {error && <p className="status error">Failed to load: {error}</p>}
      {data && <LeaderboardTable rows={rows} sortOrder={sortOrder} />}
    </main>
  );
}
