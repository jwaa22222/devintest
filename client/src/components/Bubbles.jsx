export default function Bubbles() {
  return (
    <div className="bubbles" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
