import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { SubmitPage } from './pages/SubmitPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LeaderboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/s/:token" element={<SubmitPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
