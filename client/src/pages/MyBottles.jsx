import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function MyBottles() {
  const [bottles, setBottles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/bottles/mine');
      setBottles(data.bottles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <section className="card">加载中…</section>;
  if (error) return <section className="card error">{error}</section>;

  return (
    <section className="card">
      <div className="card-head">
        <h2>我扔出的瓶子</h2>
        <button className="link-btn" onClick={load}>
          刷新
        </button>
      </div>

      {bottles.length === 0 && <p className="hint">你还没有扔过瓶子，去「扔瓶子」试试吧。</p>}

      <ul className="bottle-list">
        {bottles.map((b) => (
          <li key={b.id} className="bottle">
            <div className="bottle-msg">{b.message}</div>
            <div className="bottle-meta">
              {b.created_at} · 被捞起 {b.picked_up} 次 · {b.replies.length} 条回复
            </div>

            {b.replies.length > 0 && (
              <ul className="reply-list">
                {b.replies.map((r) => (
                  <li key={r.id} className="reply">
                    <span className="reply-author">{r.author}：</span>
                    {r.message}
                    <span className="reply-time">{r.created_at}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
