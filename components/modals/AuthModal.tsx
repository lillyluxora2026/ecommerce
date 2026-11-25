'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCustomerProfileState, saveCustomerProfile } from '@/lib/api/customer';
import { useUserStore } from '@/store/userStore';
import { useCartStore } from '@/store/cartStore';
import type { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, setUser, setSession, user } = useUserStore();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'profile'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { syncCart } = useCartStore();
  const redirectPath = searchParams?.get('redirect') || '/profile';

  // Automatically close modal if user opens it but is already fully authenticated
  useEffect(() => {
    if (user && authModalOpen && step === 'email') {
      setAuthModalOpen(false);
    }
  }, [user, authModalOpen, setAuthModalOpen, step]);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    // Reset state on close
    setTimeout(() => {
      setEmail('');
      setOtp('');
      setStep('email');
      setError(null);
    }, 300);
  };

  const completeSignIn = async (verifiedUser: User, shouldSyncCart = true) => {
    const profile = await getCustomerProfileState(verifiedUser);

    if (profile.needsOnboarding) {
      setVerifiedUser(verifiedUser);
      setFullName(profile.fullName);
      setPhone(profile.phone);
      setStep('profile');
      return;
    }

    if (shouldSyncCart) {
      await syncCart(verifiedUser);
    }

    handleClose();
    if (redirectPath === '/profile') {
      router.push(redirectPath);
    } else {
      router.refresh(); // just refresh the page they are on if they were just browsing
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
      });
      
      if (error) throw error;
      setStep('otp');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send login code.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: 'email',
      });
      
      if (error) throw error;
      
      setUser(data.user);
      setSession(data.session);
      
      if (data.user) {
        await completeSignIn(data.user);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid OTP.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verifiedUser) {
      setError('Please verify your email again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveCustomerProfile(verifiedUser, { fullName, phone });
      await completeSignIn(verifiedUser);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save your profile.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] animate-in fade-in px-4">
      <div className="w-full max-w-md bg-white border border-[#EBEBEB] flex flex-col animate-in zoom-in-95 duration-200 relative shadow-2xl p-8 md:p-10">

        <button
          type="button"
          aria-label="Close sign in dialog"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#555555] mb-1.5">
          Lily Luxora Account
        </span>
        <h2 className="text-2xl font-sans font-normal mb-2 tracking-tight text-[#121212]">Welcome Back</h2>
        <p className="text-xs sm:text-sm font-sans text-[#555555] mb-6 leading-relaxed">
          {step === 'email'
            ? 'Enter your email to sign in or create an account.'
            : step === 'otp'
              ? `Enter the 6-digit code sent to ${email}`
              : 'Finish your account setup with your full name and phone number.'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-5 text-xs font-sans">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#121212] font-sans">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-sm font-sans text-[#121212] placeholder:text-[#737373]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send login code'}
            </button>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#121212] font-sans">Verification code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full bg-white border border-[#D4D4D4] px-4 py-3 outline-none focus:border-[#121212] transition-colors text-2xl font-sans tracking-[0.35em] text-center text-[#121212] placeholder:text-[#737373]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-[#555555] hover:text-[#121212] text-xs font-sans transition-colors py-1"
            >
              Back to email entry
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#121212] font-sans">Verified Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#F8F8F8] border border-[#EBEBEB] px-3.5 py-2.5 text-sm font-sans text-[#555555]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#121212] font-sans">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
                className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-sm font-sans text-[#121212] placeholder:text-[#737373]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#121212] font-sans">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
                className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-sm font-sans text-[#121212] placeholder:text-[#737373]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !fullName.trim() || !phone.trim()}
              className="w-full bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
