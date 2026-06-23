import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Group } from '../../shared/types';
import { CopyLinkButton } from '../components/CopyLinkButton';
import { QrSheet } from '../components/QrSheet';
import { clearAdminToken, getAdminToken, setAdminToken } from '../hooks/useAdminAuth';
import { api, submitUrl } from '../lib/api';

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [password, setPassword] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [maxSubmissions, setMaxSubmissions] = useState(3);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showQrSheet, setShowQrSheet] = useState(false);

  async function loadAdminData(authToken: string) {
    const [groupsResponse, settingsResponse] = await Promise.all([
      api.getAdminGroups(authToken),
      api.getSettings(authToken),
    ]);
    setGroups(groupsResponse.groups);
    setMaxSubmissions(settingsResponse.settings.maxSubmissionsPerPlayer);
  }

  useEffect(() => {
    if (!token) return;

    void loadAdminData(token).catch((err) => {
      clearAdminToken();
      setToken(null);
      setError(err instanceof Error ? err.message : 'Session expired');
    });
  }, [token]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.adminLogin(password);
      if (!response.token) {
        throw new Error('Login failed');
      }
      setAdminToken(response.token);
      setToken(response.token);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  async function handleAddGroup(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    try {
      await api.addGroup(token, groupName);
      setGroupName('');
      setMessage('Group added');
      await loadAdminData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add group');
    }
  }

  async function handleDeleteGroup(id: string) {
    if (!token) return;
    await api.deleteGroup(token, id);
    await loadAdminData(token);
  }

  async function handleSaveSettings(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    try {
      await api.updateSettings(token, maxSubmissions);
      setMessage('Settings saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }

  async function handleResetScores() {
    if (!token) return;

    const confirmed = window.confirm(
      'Reset all scores for every group? Groups and QR codes stay the same. This cannot be undone.',
    );
    if (!confirmed) return;

    setError(null);
    try {
      const result = await api.resetScores(token);
      setMessage(`Scores reset (${result.cleared} submission${result.cleared === 1 ? '' : 's'} cleared)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset scores');
    }
  }

  async function handleExport() {
    if (!token) return;
    const csv = await api.exportCsv(token);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leaderboard.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    if (!token) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const csv = await file.text();
    const result = await api.importCsv(token, csv);
    setMessage(`Imported ${result.imported} groups`);
    await loadAdminData(token);
    event.target.value = '';
  }

  function handleLogout() {
    clearAdminToken();
    setToken(null);
    setGroups([]);
  }

  if (!token) {
    return (
      <main className="page admin-page">
        <header className="page-header compact">
          <p className="eyebrow">Organizer</p>
          <h1>Admin login</h1>
        </header>

        {error && <p className="status error">{error}</p>}

        <form className="card form-card" onSubmit={handleLogin}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit" className="btn primary">
            Log in
          </button>
        </form>
      </main>
    );
  }

  if (showQrSheet) {
    return (
      <main className="page admin-page">
        <div className="screen-only admin-toolbar">
          <button type="button" className="btn" onClick={() => setShowQrSheet(false)}>
            Back to admin
          </button>
        </div>
        <QrSheet groups={groups} />
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <header className="page-header compact admin-header">
        <div>
          <p className="eyebrow">Organizer</p>
          <h1>Admin panel</h1>
        </div>
        <button type="button" className="btn" onClick={handleLogout}>
          Log out
        </button>
      </header>

      {error && <p className="status error">{error}</p>}
      {message && <p className="status success">{message}</p>}

      <section className="card">
        <h2>Settings</h2>
        <form className="inline-form" onSubmit={handleSaveSettings}>
          <label htmlFor="max-submissions">Max submissions per QR</label>
          <input
            id="max-submissions"
            type="number"
            min="1"
            max="99"
            value={maxSubmissions}
            onChange={(event) => setMaxSubmissions(Number(event.target.value))}
          />
          <button type="submit" className="btn primary">
            Save
          </button>
        </form>
        <div className="settings-reset">
          <p className="meta">Clear every score to start a new session. Groups and QR codes are kept.</p>
          <button type="button" className="btn danger" onClick={() => void handleResetScores()}>
            Reset all scores
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Groups</h2>
        <form className="inline-form" onSubmit={handleAddGroup}>
          <input
            placeholder="Group name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            required
          />
          <button type="submit" className="btn primary">
            Add group
          </button>
        </form>

        <div className="player-grid">
          {groups.map((group) => (
            <article key={group.id} className="player-card">
              <div className="player-card-header">
                <h3>{group.name}</h3>
                <CopyLinkButton url={submitUrl(group.token)} />
              </div>
              <QRCodeSVG value={submitUrl(group.token)} size={96} level="M" includeMargin />
              <button type="button" className="btn danger" onClick={() => void handleDeleteGroup(group.id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card admin-actions">
        <button type="button" className="btn primary" onClick={() => setShowQrSheet(true)}>
          Print QR sheet
        </button>
        <button type="button" className="btn" onClick={() => void handleExport()}>
          Export CSV
        </button>
        <label className="btn file-btn">
          Import CSV
          <input type="file" accept=".csv,text/csv" onChange={(event) => void handleImport(event)} hidden />
        </label>
      </section>
    </main>
  );
}
