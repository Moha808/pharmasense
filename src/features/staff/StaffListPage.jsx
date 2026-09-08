import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StaffFormModal } from './StaffFormModal';
import { staffService } from './staffService';
import { Plus, Edit2, UserCheck, UserX, Users, Check, X } from 'lucide-react';
import { formatDate, getInitials } from '../../utils/formatters';
import toast from 'react-hot-toast';

export function StaffListPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], loading: usersLoading } = useFirestoreQuery('users');
  const { data: sales = [] } = useFirestoreQuery('sales');

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Confirm modal state
  const [confirm, setConfirm] = useState({ open: false, user: null, action: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openConfirm = (user, action) => setConfirm({ open: true, user, action });
  const closeConfirm = () => setConfirm({ open: false, user: null, action: null });

  const handleConfirmAction = async () => {
    const { user, action } = confirm;
    if (!user || !action) return;

    if (user.uid === currentUser?.uid && action !== 'activate') {
      toast.error('You cannot change the status of your own session.');
      closeConfirm();
      return;
    }

    setConfirmLoading(true);
    try {
      await staffService.updateStatus(user.uid || user.id, action, currentUser?.uid);
      const labelMap = { active: 'activated', suspended: 'suspended', rejected: 'rejected' };
      toast.success(`Account for ${user.fullName} has been ${labelMap[action] || action}.`);
    } catch {
      toast.error('Failed to update account status. Please try again.');
    } finally {
      setConfirmLoading(false);
      closeConfirm();
    }
  };

  const getConfirmProps = () => {
    const { user, action } = confirm;
    if (!user || !action) return {};
    const map = {
      active: {
        title: 'Approve Staff Account',
        message: `Grant ${user.fullName} access to PharmaSense as a Staff Cashier?`,
        confirmLabel: 'Approve & Activate',
        variant: 'success',
      },
      suspended: {
        title: 'Suspend Account',
        message: `This will immediately block ${user.fullName} from signing in. Continue?`,
        confirmLabel: 'Suspend Account',
        variant: 'warning',
      },
      rejected: {
        title: 'Reject Registration',
        message: `Reject the registration request from ${user.fullName}? The record will remain marked as rejected.`,
        confirmLabel: 'Reject Request',
        variant: 'danger',
      },
    };
    return map[action] || {};
  };

  const columns = [
    {
      header: 'Staff Member',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs flex-shrink-0 border border-primary/20">
            {getInitials(u.fullName)}
          </div>
          <div>
            <span className="font-semibold text-txt block text-sm">{u.fullName}</span>
            <span className="text-[11px] text-txt-muted">{u.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Phone',
      render: (u) => <span className="text-xs font-mono text-txt-muted">{u.phone || '—'}</span>
    },
    {
      header: 'Role',
      align: 'center',
      render: (u) => (
        <Badge variant={u.role === 'admin' ? 'purple' : 'primary'} size="sm">
          {u.role === 'admin' ? 'Administrator' : 'Staff Cashier'}
        </Badge>
      )
    },
    {
      header: 'Status',
      align: 'center',
      render: (u) => {
        const map = {
          active: { variant: 'success', label: 'Active' },
          suspended: { variant: 'danger', label: 'Suspended' },
          pending: { variant: 'warning', label: 'Pending Approval' },
          rejected: { variant: 'danger', label: 'Rejected' },
        };
        const s = map[u.status] || { variant: 'info', label: u.status };
        return <Badge variant={s.variant} size="sm" dot>{s.label}</Badge>;
      }
    },
    {
      header: 'Sales',
      render: (u) => {
        const count = sales.filter(s => s.cashierId === u.uid).length;
        return <span className="text-xs text-txt-muted">{count} transaction{count !== 1 ? 's' : ''}</span>;
      }
    },
    {
      header: 'Joined',
      render: (u) => <span className="text-xs text-txt-muted">{formatDate(u.createdAt)}</span>
    },
    {
      header: '',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          {u.status === 'pending' ? (
            <>
              <button
                onClick={() => openConfirm(u, 'active')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-success bg-success/10 hover:bg-success/20 text-xs font-bold transition-colors border border-success/20"
                title="Approve"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => openConfirm(u, 'rejected')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-danger bg-danger/10 hover:bg-danger/20 text-xs font-bold transition-colors border border-danger/20"
                title="Reject"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setUserToEdit(u); setModalOpen(true); }}
                className="p-1.5 rounded-lg text-txt-muted hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {u.uid !== currentUser?.uid && (
                <button
                  onClick={() => openConfirm(u, u.status === 'active' ? 'suspended' : 'active')}
                  className={`p-1.5 rounded-lg transition-colors ${u.status === 'active' ? 'text-txt-muted hover:text-danger hover:bg-danger/10' : 'text-txt-muted hover:text-success hover:bg-success/10'}`}
                  title={u.status === 'active' ? 'Suspend' : 'Activate'}
                >
                  {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  // Pending first, then by created date
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Accounts & Access Control"
        subtitle="Manage pharmacy team members, roles, and login permissions"
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={() => { setUserToEdit(null); setModalOpen(true); }}>
            Provision Account
          </Button>
        }
      />

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-warning/30 bg-warning/5 text-sm">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse flex-shrink-0" />
          <span className="text-txt-muted">
            <strong className="text-warning font-bold">{pendingCount} registration request{pendingCount !== 1 ? 's' : ''}</strong> pending your review — shown at the top of the table.
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search by name, email, role, or status..." className="w-full max-w-md" />
      </div>

      <Table
        columns={columns}
        data={sortedUsers}
        loading={usersLoading}
        emptyTitle="No staff accounts yet"
        emptyDescription="Provision staff accounts or share the registration link with your pharmacy team."
        emptyIcon={Users}
        emptyActionLabel="Provision First Account"
        onEmptyAction={() => { setUserToEdit(null); setModalOpen(true); }}
      />

      <StaffFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} userToEdit={userToEdit} />

      <ConfirmModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        loading={confirmLoading}
        {...getConfirmProps()}
      />
    </div>
  );
}
