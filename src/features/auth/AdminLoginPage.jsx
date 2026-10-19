import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, Send, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendPasswordReset } from '../../firebase/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function AdminLoginPage() {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  // Tracks whether we are in the middle of a login/logout flow so the
  // useEffect below does not fire a redirect while onSubmit is running.
  const isSubmittingRef = React.useRef(false);
  const from = location.state?.from?.pathname || '/app/dashboard';

  // Only redirect if a user with a confirmed non-admin role is already present
  // AND we are not currently in the middle of a login/logout flow.
  // This prevents the stale-session redirect from firing when an admin navigates
  // to this page and the previous staff session is still in localStorage.
  React.useEffect(() => {
    if (isSubmittingRef.current) return;
    if (user && typeof user.role === 'string' && user.role !== 'admin') {
      toast.error('You do not have administrative privileges.');
      logout().then(() => navigate('/'));
    }
  }, [user, navigate, logout]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isResetMode ? resetSchema : loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    isSubmittingRef.current = true;
    try {
      if (isResetMode) {
        await sendPasswordReset(data.email);
        toast.success('Password reset email sent! Check your inbox.');
        setIsResetMode(false);
      } else {
        const loggedInUser = await login(data.email, data.password);
        if (loggedInUser?.role !== 'admin') {
          await logout();
          toast.error('Access Denied: This portal is strictly for Administrators.');
        } else {
          toast.success('Welcome to the Admin Console!');
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-80 xl:w-96 flex-col justify-between p-10 border-r border-bdr flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-txt">Pharma<span className="text-primary">Sense</span></span>
        </div>

        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Administration</p>
          <h2 className="text-xl font-semibold text-txt mb-3 leading-snug">
            Centralized pharmacy governance.
          </h2>
          <p className="text-sm text-txt-muted leading-relaxed">
            Manage catalogue master data, staff accounts, batch auditing, regulatory compliance, and multi-channel reports.
          </p>
        </div>

        <div className="space-y-2">
          {['Superuser Access', 'Encrypted Credentials', 'Regulatory Audit Logs'].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-txt-muted">
              <span className="w-1 h-1 bg-primary" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Admin login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-primary flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-txt">Pharma<span className="text-primary">Sense</span></span>
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-txt mb-1">
              {isResetMode ? 'Reset Admin Password' : 'Admin Console'}
            </h1>
            <p className="text-sm text-txt-muted">
              {isResetMode
                ? 'Enter your registered administrator email to receive instructions.'
                : 'Enter your administrative credentials to manage pharmacy operations.'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@pharmasense.ng"
              leftIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            {!isResetMode && (
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={Lock}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none text-txt-muted hover:text-txt transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password')}
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-[11px] text-txt-muted hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-1"
              icon={isResetMode ? Send : ArrowRight}
            >
              {isResetMode ? 'Send Reset Link' : 'Access Console'}
            </Button>
          </form>

          {isResetMode && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="inline-flex items-center gap-1 text-xs text-txt-muted hover:text-txt transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Console Login
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-bdr flex flex-col items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-txt-muted hover:text-primary transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Return to Staff Portal
            </Link>
            <p className="text-[10px] text-txt-light text-center mt-2">
              PharmaSense Administrative Access &mdash; Confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
