import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-navy-50 text-navy-700 border-navy-200 font-medium',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    maintenance: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-300 font-medium',
    bus: 'bg-bus-100 text-bus-800 border-bus-300 font-semibold',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 font-medium'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-full font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {variant === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {variant === 'maintenance' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
      {variant === 'danger' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
      {children}
    </span>
  );
};
