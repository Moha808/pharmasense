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
        // Always clean up the temporary app — this does NOT affect the main session
        await deleteApp(tempApp);
      }

      // Create their pending profile in Firestore
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

      // Show success modal — do NOT navigate away yet
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
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200"
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
        <div className="flex flex-col items-center text-center py-4 gap-5">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-success" />
          </div>
          <div>
            <h4 className="text-base font-bold text-txt mb-2">Account Request Received</h4>
            <p className="text-sm text-txt-muted leading-relaxed">
              Your registration has been submitted successfully. A pharmacy administrator will review
              your request and activate your account. You will be able to sign in once approved.
            </p>
          </div>
          <Button variant="primary" size="md" className="w-full font-bold" onClick={handleSuccessClose}>
            Return to Login
          </Button>
        </div>
      </Modal>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-5">
          <div
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg cursor-pointer hover:shadow-primary/30 hover:scale-105 transition-all duration-200"
          >
            PS
          </div>
        </div>
        <h2 className="text-center text-2xl font-black text-txt tracking-tight">
          Request Staff Access
        </h2>
        <p className="mt-1.5 text-center text-sm text-txt-muted">
          Fill in your details — an admin will review and approve your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className="py-8 px-7 sm:px-10 rounded-2xl border border-bdr"
          style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 8px 32px rgba(17,155,141,0.07)' }}
        >
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              placeholder="e.g. Pharm. Mary Johnson"
              leftIcon={UserPlus}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Email"
                type="email"
                placeholder="mary@pharmasense.com"
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
            </div>

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
              className="w-full mt-2 font-bold shadow-lg shadow-primary/20"
            >
              Submit Registration Request
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-bdr text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-txt-muted hover:text-txt transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Staff Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
