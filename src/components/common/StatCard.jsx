import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  indicator,
  indicatorType = 'positive', // 'positive' | 'negative' | 'neutral' | 'warning'
  subtitle,
  iconBg = 'bg-navy-50 text-navy-700',
  onClick
}) => {
  const indicatorColors = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    negative: 'text-rose-700 bg-rose-50 border-rose-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    neutral: 'text-slate-600 bg-slate-100 border-slate-200'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-navy-900">{value}</span>
            {indicator && (
              <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${indicatorColors[indicatorType]}`}>
                {indicator}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border border-slate-100 shrink-0 ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
    </div>
  );
};
