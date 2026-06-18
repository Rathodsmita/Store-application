import React from 'react';
export default function RatingRing({ value = 0, size = 64, stroke = 7, label = 'avg' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, Math.min(value, 5)) / 5;
  const dash = circumference * fraction;

  return (
    <div className="rating-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="rating-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="rating-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="rating-ring-value" style={{ fontSize: size * 0.26 }}>
        {value > 0 ? value.toFixed(1) : '—'}
        <small>{label}</small>
      </div>
    </div>
  );
}
