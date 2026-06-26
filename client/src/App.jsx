import { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import Bubbles from './components/Bubbles.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ThrowBottle from './pages/ThrowBottle.jsx';
import CatchBottle from './pages/CatchBottle.jsx';
import MyBottles from './pages/MyBottles.jsx';

const TABS = [
  { key: 'throw', label: '🍾 扔瓶子' },
  { key: 'catch', label: '🌊 捞瓶子' },
  { key: 'mine', label: '📜 我的瓶子' },
];

export default function App() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState('throw');

  if (loading) {
    return (
      <>
        <Bubbles />
        <div className="centered">正在打捞海面…</div>
      </>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      <Bubbles />
      <div className="app">
        <header className="app-header">
          <div className="brand">
            <div className="brand-mark">🌊</div>
            <div className="brand-text">
              <h1>漂流瓶</h1>
              <p className="tagline">DRIFT · 把心事交给大海</p>
            </div>
          </div>
          <div className="user-box">
            <span className="user-chip">👋 {user.username}</span>
            <button className="link-btn" onClick={logout}>
              退出
            </button>
          </div>
        </header>

        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className="content" key={tab}>
          {tab === 'throw' && <ThrowBottle />}
          {tab === 'catch' && <CatchBottle />}
          {tab === 'mine' && <MyBottles />}
        </main>
      </div>
    </>
  );
}
