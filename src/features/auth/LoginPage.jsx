import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendPasswordReset } from '../../firebase/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
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

  // If already logged in and it's an admin, redirect them out of the staff portal
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
          // It's the staff portal, but an admin logged in.
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
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div onClick={() => navigate('/')}
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-md cursor-pointer hover:shadow-lg transition-all">
            PS
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-txt tracking-tight">
          Staff <span className="text-primary">Portal</span>
        </h2>
        <p className="mt-1 text-center text-xs text-txt-muted">
          {isResetMode ? 'Reset your pharmacy terminal password' : 'Sign in to your pharmacy workspace'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-6 sm:px-10 rounded-2xl border border-bdr shadow-xl transition-all duration-300"
             style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 10px 30px rgba(17, 155, 141, 0.05)' }}>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input label="Work Email Address" type="email" placeholder="e.g. staff@pharmasense.com"
              leftIcon={Mail} error={errors.email?.message} {...register('email')} />

            {!isResetMode && (
              <div className="space-y-1">
                <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
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
              {isResetMode ? 'Send Reset Link' : 'Sign In to Workspace'}
            </Button>
          </form>

          {isResetMode && (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setIsResetMode(false)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-txt-muted hover:text-txt transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-bdr flex flex-col items-center gap-3">
            <div className="text-center text-[10px] text-txt-muted/50">
              PharmaSense Operations System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
