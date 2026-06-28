import { useState } from 'react';
import { api } from '../api.js';
import { useRipple } from '../useRipple.js';
import Typewriter from '../components/Typewriter.jsx';

export default function CatchBottle() {
  const ripple = useRipple();
  const [bottle, setBottle] = useState(null);
  const [reply, setReply] = useState('');
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [replied, setReplied] = useState(false);
  const [emerging, setEmerging] = useState(false);

  async function handleCatch() {
    setInfo(null);
    setReplied(false);
    setReply('');
    setBusy(true);
    setBottle(null);
    setEmerging(true);
    try {
      const data = await api('/bottles/catch', { method: 'POST' });
      await new Promise((r) => setTimeout(r, 700));
      setBottle(data.bottle);
    } catch (err) {
      setBottle(null);
      setInfo({ type: 'error', text: err.message });
    } finally {
      setEmerging(false);
      setBusy(false);
    }
  }

  async function handleReply(e) {
    e.preventDefault();
    setInfo(null);
    setBusy(true);
    try {
      await api(`/bottles/${bottle.id}/replies`, {
        method: 'POST',
        body: { message: reply },
      });
      setReplied(true);
      setReply('');
      setInfo({ type: 'ok', text: '回复已寄出，对方会在「我的瓶子」里看到 💌' });
    } catch (err) {
      setInfo({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>捞一个瓶子</h2>
      <p className="hint">从大海里随机捞起一个陌生人的瓶子。</p>

      <button className="primary" onClick={(e) => { ripple(e); handleCatch(); }} disabled={busy}>
        {busy ? '打捞中…' : bottle ? '再捞一个' : '捞瓶子'}
      </button>

      {info && info.type === 'error' && !bottle && (
        <div className="error" style={{ marginTop: '1rem' }}>
          {info.text}
        </div>
      )}

      {emerging && (
        <div className="catch-stage">
          <div className="catch-bottle">🍾</div>
        </div>
      )}

      {bottle && (
        <div className="bottle">
          <div className="catch-bottle pop">🍾</div>
          <div className="scroll-paper">
            <Typewriter className="paper-text" text={bottle.message} speed={38} />
            <div className="paper-from">— {bottle.author} · {bottle.created_at}</div>
          </div>

          {!replied ? (
            <form onSubmit={handleReply} className="reply-form">
              <textarea
                rows={3}
                value={reply}
                maxLength={500}
                placeholder="给 TA 回复点什么…"
                onChange={(e) => setReply(e.target.value)}
              />
              <button className="primary" disabled={busy || !reply.trim()} onClick={ripple}>
                寄出回复
              </button>
            </form>
          ) : null}

          {info && (
            <div className={info.type === 'ok' ? 'success' : 'error'}>{info.text}</div>
          )}
        </div>
      )}
    </section>
  );
}
