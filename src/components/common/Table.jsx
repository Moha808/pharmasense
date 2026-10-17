import React, { useState } from 'react';
import { SkeletonRow } from './SkeletonRow';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className={`w-full overflow-hidden border border-bdr ${className}`} style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="border-b border-bdr text-[10px] font-bold uppercase tracking-[0.08em] text-txt-light"
              style={{ backgroundColor: 'var(--color-bg-alt)' }}
            >
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bdr text-[12.5px] text-txt">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="table-row-hover transition-colors duration-100"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
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
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t border-bdr text-[11px] text-txt-muted"
          style={{ backgroundColor: 'var(--color-bg-alt)' }}
        >
          <span>
            Showing <strong className="text-txt font-semibold">{startIndex + 1}</strong>–
            <strong className="text-txt font-semibold">{Math.min(startIndex + pageSize, data.length)}</strong> of{' '}
            <strong className="text-txt font-semibold">{data.length}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 border border-bdr hover:bg-bg-alt disabled:opacity-30 disabled:cursor-not-allowed text-txt transition-colors"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 tabular-nums">{currentPage}/{totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 border border-bdr hover:bg-bg-alt disabled:opacity-30 disabled:cursor-not-allowed text-txt transition-colors"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
