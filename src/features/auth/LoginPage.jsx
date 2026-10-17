import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendPasswordReset } from '../../firebase/auth';

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const from = location.state?.from?.pathname || '/app/dashboard';

  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isResetMode ? resetSchema : loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isResetMode) {
        await sendPasswordReset(data.email);
        toast.success('Password reset email sent! Check your inbox.');
        setIsResetMode(false);
      } else {
        const loggedInUser = await login(data.email, data.password);
        if (loggedInUser?.role === 'admin') {
          toast.success('Welcome back, Admin!');
          navigate(from, { replace: true });
        } else {
          toast.success('Welcome back to the terminal!');
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Left decorative panel — visible on lg+ screens */}
      <div
        className="hidden lg:flex lg:w-80 xl:w-96 flex-col justify-between p-10 border-r border-bdr flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary flex items-center justify-center text-white text-[11px] font-bold">
            PS
          </div>
          <span className="font-semibold text-sm text-txt">Pharma<span className="text-primary">Sense</span></span>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Staff Portal</p>
          <h2 className="text-xl font-semibold text-txt mb-3 leading-snug">
            Pharmacy operations<br />made reliable.
          </h2>
          <p className="text-sm text-txt-muted leading-relaxed">
            FEFO inventory management, NAFDAC compliance, and a fast point-of-sale — in one integrated system.
          </p>
        </div>

        {/* Trust signals */}
        <div className="space-y-2">
          {['NAFDAC Compliant', 'Role-Based Access', 'Immutable Audit Trail'].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-txt-muted">
              <span className="w-1 h-1 bg-primary" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-primary flex items-center justify-center text-white text-[11px] font-bold">
              PS
            </div>
            <span className="font-semibold text-sm text-txt">Pharma<span className="text-primary">Sense</span></span>
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-txt mb-1">
              {isResetMode ? 'Reset Password' : 'Sign in'}
            </h1>
            <p className="text-sm text-txt-muted">
              {isResetMode
                ? 'Enter your email to receive a reset link.'
                : 'Enter your work credentials to access the workspace.'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Work Email"
              type="email"
              placeholder="staff@pharmasense.ng"
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
              {isResetMode ? 'Send Reset Link' : 'Sign In'}
            </Button>
          </form>

          {isResetMode && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="inline-flex items-center gap-1 text-xs text-txt-muted hover:text-txt transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </button>
            </div>
          )}

          <p className="text-[10px] text-txt-light text-center mt-10">
            PharmaSense Operations System &mdash; Authorised Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
