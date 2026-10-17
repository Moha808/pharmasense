import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * ConfirmModal — replaces window.confirm() across the app.
 *
 * Props:
 *   isOpen       bool
 *   onClose      () => void    called on cancel or close
 *   onConfirm    () => void    called on confirm
 *   title        string
 *   message      string | ReactNode
 *   confirmLabel string        default "Confirm"
 *   cancelLabel  string        default "Cancel"
 *   variant      'danger' | 'warning' | 'info' | 'success'   default 'danger'
 *   loading      bool
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const iconMap = {
    danger: <Trash2 className="w-6 h-6 text-danger" />,
    warning: <AlertTriangle className="w-6 h-6 text-warning" />,
    info: <Info className="w-6 h-6 text-primary" />,
    success: <CheckCircle2 className="w-6 h-6 text-success" />,
  };

  const colorMap = {
    danger: 'bg-danger/10',
    warning: 'bg-warning/10',
    info: 'bg-primary/10',
    success: 'bg-success/10',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className={`w-11 h-11 border border-bdr flex items-center justify-center ${colorMap[variant]}`}>
          {iconMap[variant]}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-txt mb-1">{title}</h3>
          {message && <p className="text-xs text-txt-muted leading-relaxed max-w-sm">{message}</p>}
        </div>
        <div className="flex gap-3 w-full mt-2">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            className="flex-1 font-bold"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
