import React, { useState } from 'react';

function Star({ filled, onClick, onMouseEnter, onMouseLeave, interactive, size }) {
  return (
    <button
      type="button"
      className={`star-btn ${filled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={interactive ? onMouseEnter : undefined}
      onMouseLeave={interactive ? onMouseLeave : undefined}
      disabled={!interactive}
      aria-label="star"
      tabIndex={interactive ? 0 : -1}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5l2.95 6.46 7.05.7-5.3 4.86 1.55 6.98L12 17.9l-6.25 3.6 1.55-6.98-5.3-4.86 7.05-.7L12 2.5z" />
      </svg>
    </button>
  );
}
export default function StarRating({ value, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === 'function';
  const display = hovered || value || 0;

  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          filled={n <= display}
          interactive={interactive}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        />
      ))}
    </div>
  );
}
