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
  const iconSchemes = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/15' },
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/15' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/15' },
    danger:  { bg: 'bg-danger/10',  text: 'text-danger',  border: 'border-danger/15' },
    blue:    { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200/50' },
    purple:  { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-200/50' },
  };

  const scheme = iconSchemes[color] || iconSchemes.primary;

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-bdr p-5
        transition-all duration-200 group relative overflow-hidden
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : ''}
        ${className}
      `}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
      }}
    >
      {/* Subtle top-left color accent stripe */}
      <div className={`absolute top-0 left-0 h-0.5 w-16 rounded-full ${scheme.bg.replace('/10', '/40')}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mb-2.5">{title}</p>
          <p className="text-[1.75rem] font-black text-txt tracking-tight leading-none">{value}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${scheme.bg} ${scheme.text} ${scheme.border}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {change && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${changeType === 'up' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
              {changeType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-[11px] text-txt-muted truncate">{subtitle}</span>}
        </div>
      )}

      {onClick && (
        <div className="mt-3 pt-3 border-t border-bdr/50 flex items-center justify-end">
          <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${scheme.text}`}>
            View details <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  );
}
