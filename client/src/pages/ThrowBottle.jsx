import { useState } from 'react';
import { api } from '../api.js';

const MAX = 500;

export default function ThrowBottle() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleThrow(e) {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      await api('/bottles', { method: 'POST', body: { message } });
      setMessage('');
      setStatus({ type: 'ok', text: '瓶子已经扔进大海啦 🍾' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>扔一个瓶子</h2>
      <p className="hint">把想说的话写进瓶子，匿名漂向远方。</p>
      <form onSubmit={handleThrow}>
        <textarea
          value={message}
          maxLength={MAX}
          rows={6}
          placeholder="此刻你想说点什么？"
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="counter">
          {message.length}/{MAX}
        </div>
        {status && <div className={status.type === 'ok' ? 'success' : 'error'}>{status.text}</div>}
        <button className="primary" disabled={busy || !message.trim()}>
          {busy ? '投递中…' : '扔出去'}
        </button>
      </form>
    </section>
  );
}
