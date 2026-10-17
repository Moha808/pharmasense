import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeType = 'up',
  icon: Icon,
  color = 'primary',
  onClick,
  className = ''
}) {
  const iconColors = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger:  'text-danger',
    blue:    'text-blue-400',
    purple:  'text-purple-400',
  };

  const iconColor = iconColors[color] || iconColors.primary;

  return (
    <div
      onClick={onClick}
      className={`
        border border-bdr p-5
        ${onClick ? 'cursor-pointer hover:border-txt-light transition-colors duration-150 group' : ''}
        ${className}
      `}
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider">{title}</p>
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />}
      </div>

      <p className="text-[1.6rem] font-bold text-txt leading-none tabular-nums">{value}</p>

      {(subtitle || change) && (
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          {change && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold
              ${changeType === 'up' ? 'text-success' : 'text-danger'}`}>
              {changeType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-[11px] text-txt-muted truncate">{subtitle}</span>}
        </div>
      )}

      {onClick && (
        <div className="mt-3 pt-3 border-t border-bdr flex items-center justify-end">
          <span className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${iconColor}`}>
            Details <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  );
}
