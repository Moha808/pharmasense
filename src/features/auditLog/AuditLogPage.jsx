import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { PageHeader } from '../../components/common/PageHeader';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { formatDateTime } from '../../utils/formatters';
import { ShieldAlert, Eye, Lock, FileJson } from 'lucide-react';

export function AuditLogPage() {
  const { data: logs = [], loading: logsLoading } = useFirestoreQuery('auditLogs');
  const { data: users = [] } = useFirestoreQuery('users');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const filteredLogs = logs.filter(l =>
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.targetCollection?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.targetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Timestamp',
      render: (l) => <span className="text-text-muted text-xs font-mono">{formatDateTime(l.timestamp)}</span>
    },
    {
      header: 'Performed By',
      render: (l) => {
        const u = users.find(user => user.uid === l.userId);
        return (
          <div>
            <span className="font-bold text-text-main block">{u?.fullName || l.userId}</span>
            <span className="text-[10px] text-text-muted capitalize">{u?.role || 'System'}</span>
          </div>
        );
      }
    },
    {
      header: 'Action Taken',
      render: (l) => (
        <span className="font-mono text-xs font-bold text-primary bg-primary-light/50 px-2 py-0.5 rounded border border-primary/20">
          {l.action}
        </span>
      )
    },
    {
      header: 'Target Collection',
      align: 'center',
      render: (l) => (
        <Badge variant="neutral" size="sm">
          {l.targetCollection}
        </Badge>
      )
    },
    {
      header: 'Target Document ID',
      render: (l) => <span className="font-mono text-xs text-text-muted">{l.targetId || '—'}</span>
    },
    {
      header: 'Payload Details',
      align: 'right',
      render: (l) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedLog(l)}
        >
          View Diff
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tamper-Proof Audit Trail"
        subtitle="Cryptographically immutable record of every administrative action, inventory change, and transaction"
        badge={
          <Badge variant="purple" size="md">
            <Lock className="w-3 h-3 mr-1" /> Append-Only Security
          </Badge>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search logs by action, collection, target ID, or user ID..."
          className="w-full max-w-md"
        />
      </div>

      <Table
        columns={columns}
        data={filteredLogs}
        loading={logsLoading}
        emptyTitle="No audit logs recorded"
        emptyDescription="System actions and inventory changes will be automatically recorded here."
        emptyIcon={ShieldAlert}
      />

      {/* JSON Payload Diff Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Entry Inspection"
        subtitle={`Action: ${selectedLog?.action} on ${selectedLog?.targetCollection}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-surface-alt rounded-xl border border-border">
            <div>
              <span className="text-text-muted block">Timestamp:</span>
              <strong className="text-text-main font-mono">{formatDateTime(selectedLog?.timestamp)}</strong>
            </div>
            <div>
              <span className="text-text-muted block">Actor ID:</span>
              <strong className="text-text-main font-mono">{selectedLog?.userId}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-bold text-text-muted block mb-1 flex items-center gap-1">
                <FileJson className="w-3.5 h-3.5" /> Before Value:
              </span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono h-48">
                {JSON.stringify(selectedLog?.beforeValue || 'null (Newly Created)', null, 2)}
              </pre>
            </div>

            <div>
              <span className="font-bold text-text-muted block mb-1 flex items-center gap-1">
                <FileJson className="w-3.5 h-3.5" /> After / Current Value:
              </span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono h-48">
                {JSON.stringify(selectedLog?.afterValue || {}, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setSelectedLog(null)}>
              Close Inspector
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
