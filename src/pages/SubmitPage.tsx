import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { GroupPublicInfo } from '../../shared/types';
import { api } from '../lib/api';

export function SubmitPage() {
  const { token = '' } = useParams();
  const [info, setInfo] = useState<GroupPublicInfo | null>(null);
  const [score, setScore] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const next = await api.getGroupInfo(token);
        if (active) {
          setInfo(next);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load group');
        }
      }
    }

    if (token) {
      void load();
    }

    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await api.submitScore(token, Number(score));
      setSuccess('Score submitted!');
      setScore('');
      setInfo((current) =>
        current
          ? {
              ...current,
              submissionCount: result.submissionCount,
              canSubmit: result.submissionCount < result.maxSubmissions,
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page submit-page">
      <header className="page-header compact">
        <p className="eyebrow">Score submission</p>
        <h1>{info?.name ?? 'Group'}</h1>
      </header>

      {error && <p className="status error">{error}</p>}
      {success && <p className="status success">{success}</p>}

      {info && (
        <p className="meta">
          {info.submissionCount} of {info.maxSubmissions} submissions used
        </p>
      )}

      {info?.canSubmit ? (
        <form className="card form-card" onSubmit={handleSubmit}>
          <label htmlFor="score">Your score</label>
          <input
            id="score"
            type="number"
            min="0"
            step="1"
            required
            value={score}
            onChange={(event) => setScore(event.target.value)}
          />
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit score'}
          </button>
        </form>
      ) : (
        info && <p className="status">Submission limit reached. Thanks for playing!</p>
      )}
    </main>
  );
}
