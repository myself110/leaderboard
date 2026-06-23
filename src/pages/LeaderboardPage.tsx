import { LeaderboardTable } from '../components/LeaderboardTable';
import { useLeaderboard } from '../hooks/useLeaderboard';

export function LeaderboardPage() {
  const { data, error, loading } = useLeaderboard();

  return (
    <main className="page leaderboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Live event</p>
          <h1>Leaderboard</h1>
        </div>
        {data && (
          <p className="meta">
            Max {data.maxSubmissionsPerPlayer} submissions per group · Updated{' '}
            {new Date(data.updatedAt).toLocaleTimeString()}
          </p>
        )}
      </header>

      {loading && !data && <p className="status">Loading scores…</p>}
      {error && <p className="status error">Failed to load: {error}</p>}
      {data && <LeaderboardTable rows={data.rows} />}
    </main>
  );
}
