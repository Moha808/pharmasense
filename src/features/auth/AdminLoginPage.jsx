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
  const from = location.state?.from?.pathname || '/app/dashboard';

  // If a staff member tries to access the admin portal while logged in, log them out or redirect
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
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
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div onClick={() => navigate('/')}
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-md cursor-pointer hover:shadow-lg transition-all">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-txt tracking-tight">
          Admin <span className="text-primary">Console</span>
        </h2>
        <p className="mt-1 text-center text-xs text-txt-muted">
          {isResetMode ? 'Reset your administrator password' : 'Secure access for pharmacy management'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-6 sm:px-10 rounded-2xl border border-bdr shadow-2xl transition-all duration-300 bg-bg-card">

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input label="Admin Email Address" type="email" placeholder="e.g. admin@pharmasense.com"
              leftIcon={Mail} error={errors.email?.message} {...register('email')} />

            {!isResetMode && (
              <div className="space-y-1">
                <Input label="Admin Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  leftIcon={Lock}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={errors.password?.message} {...register('password')} />
                
                <div className="flex justify-end">
                  <button type="button" onClick={() => setIsResetMode(true)} className="text-[11px] font-semibold text-primary hover:text-primary-dark">
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={isLoading}
              className="w-full mt-2 font-bold shadow-md shadow-primary/20" icon={isResetMode ? Send : ArrowRight}>
              {isResetMode ? 'Send Reset Link' : 'Access Console'}
            </Button>
          </form>

          {isResetMode && (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setIsResetMode(false)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-txt-muted hover:text-txt transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back to Secure Login
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-bdr flex flex-col items-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-txt-muted hover:text-primary transition-colors">
              <Users className="w-3.5 h-3.5" /> Return to Staff Portal
            </Link>
            <div className="text-center text-[10px] text-txt-muted/50">
              PharmaSense Administrative Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
