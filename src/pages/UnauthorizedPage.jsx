import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-border shadow-modal max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-danger-light text-danger flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-main">Access Restricted</h2>
        <p className="text-xs text-text-muted mt-2 mb-6 leading-relaxed">
          Your current account role (<strong className="capitalize text-text-main">{user?.role || 'Staff'}</strong>) does not have administrative permission to view this section.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/app/dashboard')}
            icon={ArrowLeft}
          >
            Return to Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/app/pos')}
          >
            Go to Point of Sale
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-border shadow-modal max-w-md w-full text-center">
        <div className="text-5xl font-black text-primary mb-2">404</div>
        <h2 className="text-lg font-bold text-text-main">Page Not Found</h2>
        <p className="text-xs text-text-muted mt-2 mb-6">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/app/dashboard')}
          icon={ArrowLeft}
        >
          Return to Safety
        </Button>
      </div>
    </div>
  );
}
