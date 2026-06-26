import { useEffect, useRef, useState } from 'react';

export default function Typewriter({ text, speed = 38, className }) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    setShown('');
    setDone(false);
    idx.current = 0;
    if (!text) return undefined;
    const id = setInterval(() => {
      idx.current += 1;
      setShown(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={className}>
      {shown}
      {!done && <span className="caret" />}
    </span>
  );
}
