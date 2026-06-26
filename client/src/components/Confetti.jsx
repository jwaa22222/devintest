import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#2dd4bf', '#38bdf8', '#4f7cff', '#fbbf24', '#f472b6', '#ffffff'];

export default function Confetti({ fire }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    const w = canvas.offsetWidth;
    const originX = w / 2;
    const originY = canvas.offsetHeight * 0.35;

    for (let i = 0; i < 130; i += 1) {
      const angle = Math.PI * 2 * Math.random();
      const speed = 4 + Math.random() * 9;
      particles.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 4 + Math.random() * 7,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
      });
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      let alive = false;
      for (const p of particles.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.vy += 0.22;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.012;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (alive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        particles.current = [];
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      }
    }
    cancelAnimationFrame(rafRef.current);
    tick();

    return () => cancelAnimationFrame(rafRef.current);
  }, [fire]);

  return createPortal(
    <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />,
    document.body
  );
}
