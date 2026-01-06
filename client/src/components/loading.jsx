import './loading.css';

export function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
}

export function InlineSpinner() {
  return <div className="inline-spinner"></div>;
}

export function LoadingSkeleton({ type = 'text', count = 1 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`skeleton skeleton-${type}`}></div>
      ))}
    </>
  );
}
