import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 border-b border-bdr overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2
              ${isActive
                ? 'border-primary text-primary bg-primary/5 font-bold'
                : 'border-transparent text-txt-muted hover:text-txt'}
            `}
            style={!isActive ? { ':hover': { backgroundColor: 'var(--color-bg-alt)' } } : {}}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = ''; }}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-primary text-white' : 'border border-bdr text-txt-muted'}`}
                    style={!isActive ? { backgroundColor: 'var(--color-bg-alt)' } : {}}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
