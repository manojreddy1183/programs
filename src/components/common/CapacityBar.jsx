import React from 'react';

export const CapacityBar = ({ assigned = 0, total = 40, showLabel = true, size = 'md' }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((assigned / total) * 100)) : 0;

  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (percentage >= 95) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (percentage >= 80) {
    barColor = 'bg-bus-400';
    badgeColor = 'text-amber-800 bg-amber-50 border-amber-300';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">
            {assigned} / {total} seats
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass} border border-slate-200/50`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
