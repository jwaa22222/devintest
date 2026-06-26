import { useEffect, useRef } from 'react';

const WAVE_LAYERS = [
  { amp: 26, len: 0.014, speed: 0.018, y: 0.62, color: 'rgba(45, 212, 191, 0.18)' },
  { amp: 34, len: 0.011, speed: -0.013, y: 0.7, color: 'rgba(56, 189, 248, 0.16)' },
  { amp: 44, len: 0.008, speed: 0.009, y: 0.8, color: 'rgba(79, 124, 255, 0.18)' },
  { amp: 60, len: 0.006, speed: -0.006, y: 0.92, color: 'rgba(13, 42, 71, 0.55)' },
];

const BUBBLE_COUNT = 46;

export default function OceanBackground() {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const bubbles = Array.from({ length: BUBBLE_COUNT }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 5,
      speed: 0.0006 + Math.random() * 0.0018,
      drift: (Math.random() - 0.5) * 0.0006,
      alpha: 0.15 + Math.random() * 0.4,
    }));

    let t = 0;

    function draw() {
      t += 1;
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.05;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.05;

      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#06141f');
      bg.addColorStop(0.5, '#0a2740');
      bg.addColorStop(1, '#0e3c5c');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const gx = pointer.current.x * w;
      const gy = pointer.current.y * h;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.5);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      glow.addColorStop(0.4, 'rgba(45, 212, 191, 0.08)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      for (const b of bubbles) {
        b.y -= b.speed;
        b.x += b.drift;
        if (b.y < -0.05) {
          b.y = 1.05;
          b.x = Math.random();
        }
        const px = b.x * w;
        const py = b.y * h;
        ctx.beginPath();
        ctx.arc(px, py, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
        ctx.fill();
      }

      for (const layer of WAVE_LAYERS) {
        const baseY = h * layer.y;
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, baseY);
        for (let x = 0; x <= w; x += 8) {
          const y =
            baseY +
            Math.sin(x * layer.len + t * layer.speed) * layer.amp +
            Math.sin(x * layer.len * 0.5 + t * layer.speed * 1.6) * layer.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    function onMove(e) {
      pointer.current.tx = e.clientX / window.innerWidth;
      pointer.current.ty = e.clientY / window.innerHeight;
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="ocean-canvas" aria-hidden="true" />;
}
