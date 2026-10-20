import React from 'react';

interface GoalRingSVGProps {
  current: number;
  target: number;
  size?: number; // default 14px to respect micro-UI
  strokeWidth?: number;
  className?: string;
}

export const GoalRingSVG: React.FC<GoalRingSVGProps> = ({
  current,
  target,
  size = 14,
  strokeWidth = 2,
  className = '',
}) => {
  if (target <= 0) return null;

  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = current >= target;

  const color = isComplete
    ? '#30d158' // Green complete
    : percentage > 75
    ? '#0a84ff' // Blue high
    : '#ff9f0a'; // Orange in progress

  return (
    <div
      className={`inline-flex items-center justify-center relative ${className}`}
      title={`Objetivo: ${current} / ${target} palabras (${Math.round(percentage)}%)`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
};
