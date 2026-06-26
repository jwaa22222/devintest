import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import Bubbles from '../components/Bubbles.jsx';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Bubbles />
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-badge">🍾</div>
          <h1>漂流瓶</h1>
          <p className="subtitle">写下心事，扔进大海，等待有缘人捞起。</p>

          <div className="auth-toggle">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              登录
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              用户名
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="2-20 个字符"
                autoComplete="username"
              />
            </label>
            <label>
              密码
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 个字符"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="primary" disabled={busy}>
              {busy ? '请稍候…' : mode === 'login' ? '登录' : '注册并进入'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
