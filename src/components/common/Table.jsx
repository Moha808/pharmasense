import React from 'react';
import { SkeletonRow } from './SkeletonRow';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function Table({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There is currently no data to display.',
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  pageSize = 10,
  className = ''
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className={`w-full overflow-hidden bg-bg-card rounded-xl border border-bdr shadow-card ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-bdr text-[11px] font-bold uppercase tracking-wider text-txt-muted"
                style={{ backgroundColor: 'var(--color-bg-alt)' }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bdr text-xs text-txt">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="transition-colors duration-150"
                  style={{ ':hover': { backgroundColor: 'var(--color-bg-alt)' } }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : (col.accessor ? row[col.accessor] : null)}
                    </td>
                  ))}
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
      </div>

      {!loading && data.length === 0 && (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      )}

      {!loading && data.length > pageSize && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-bdr text-xs text-txt-muted"
             style={{ backgroundColor: 'var(--color-bg-alt)' }}>
          <span>
            Showing <strong className="text-txt">{startIndex + 1}</strong> to{' '}
            <strong className="text-txt">{Math.min(startIndex + pageSize, data.length)}</strong> of{' '}
            <strong className="text-txt">{data.length}</strong> items
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-bdr bg-bg-card hover:bg-bg-alt disabled:opacity-40 disabled:cursor-not-allowed text-txt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-bdr bg-bg-card hover:bg-bg-alt disabled:opacity-40 disabled:cursor-not-allowed text-txt"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
