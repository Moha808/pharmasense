import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

import { UserPlus, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from '../../firebase/config';
import { insertDocument } from '../../firebase/firestore';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function StaffRegistrationPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase is not configured.');
      }

      // IMPORTANT: Use a secondary temporary Firebase app to register the new user.
      // This prevents the current logged-in session (e.g., Admin) from being displaced.
      const tempAppName = 'TempRegistrationApp-' + Date.now();
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);

      let uid;
      try {
        const cred = await createUserWithEmailAndPassword(
          tempAuth,
          data.email.trim().toLowerCase(),
          data.password
        );
        uid = cred.user.uid;
      } finally {
        await deleteApp(tempApp);
      }

      // Create pending profile in Firestore
      await insertDocument('users', {
        uid,
        fullName: data.fullName,
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        role: 'staff',
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: 'self-registration',
      }, uid, uid);

      setShowSuccessModal(true);
    } catch (err) {
      let msg = err.message || 'Registration failed.';
      if (msg.includes('email-already-in-use')) {
        msg = 'An account with this email already exists. Please use a different email or log in.';
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Registration Submitted"
        showClose={false}
        size="sm"
      >
        <div className="flex flex-col items-center text-center py-2 gap-4">
          <div className="w-12 h-12 border border-bdr flex items-center justify-center bg-success/10 text-success">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-txt mb-1">Account Request Received</h4>
            <p className="text-xs text-txt-muted leading-relaxed">
              Your registration has been submitted successfully. A pharmacy administrator will review
              your request and activate your account. You will be able to sign in once approved.
            </p>
          </div>
          <Button variant="primary" size="md" className="w-full mt-2" onClick={handleSuccessClose}>
            Return to Login
          </Button>
        </div>
      </Modal>

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-80 xl:w-96 flex-col justify-between p-10 border-r border-bdr flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary flex items-center justify-center text-white text-[11px] font-bold">
            PS
          </div>
          <span className="font-semibold text-sm text-txt">Pharma<span className="text-primary">Sense</span></span>
        </div>

        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Onboarding</p>
          <h2 className="text-xl font-semibold text-txt mb-3 leading-snug">
            Join the dispensing team.
          </h2>
          <p className="text-sm text-txt-muted leading-relaxed">
            Register your staff profile to receive an assigned register terminal and start dispensing with automated FEFO tracking.
          </p>
        </div>

        <div className="space-y-2">
          {['Identity Verification', 'Role Authorization Required', 'Shift Tracking'].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-txt-muted">
              <span className="w-1 h-1 bg-primary" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right form area */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-primary flex items-center justify-center text-white text-[11px] font-bold">
              PS
            </div>
            <span className="font-semibold text-sm text-txt">Pharma<span className="text-primary">Sense</span></span>
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-txt mb-1">
              Request Staff Access
            </h1>
            <p className="text-sm text-txt-muted">
              Fill in your details — an admin will review and approve your account.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              placeholder="Pharm. Mary Johnson"
              leftIcon={UserPlus}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="mary@pharmasense.ng"
              leftIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              placeholder="+234 803 444 5566"
              leftIcon={Phone}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Create Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              leftIcon={Lock}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none text-txt-muted hover:text-txt transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              Submit Registration Request
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-bdr text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-txt-muted hover:text-txt transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
