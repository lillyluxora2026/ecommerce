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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#382F2A]/50 backdrop-blur-sm animate-in fade-in px-4">
      <div className="w-full max-w-md rounded-3xl bg-[#F7F3ED] border border-[#D8CBBE] flex flex-col animate-in zoom-in-95 duration-200 relative shadow-2xl p-8 md:p-10">
        
        <button 
          type="button"
          aria-label="Close sign in dialog"
          onClick={handleClose} 
          className="absolute top-5 right-5 p-2 text-[#63574F] hover:text-[#382F2A] hover:bg-[#EFE7DE] transition-colors rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#8B7768] mb-1.5">
          Lily Luxora Account
        </span>
        <h2 className="text-3xl font-heading font-normal italic mb-2 tracking-wide text-[#382F2A]">Welcome Back</h2>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] mb-7 leading-relaxed">
          {step === 'email'
            ? 'Enter your email to sign in or create an account.'
            : step === 'otp'
              ? `Enter the 6-digit code sent to ${email}`
              : 'Finish your account setup with your full name and phone number.'}
        </p>

        {error && (
          <div className="rounded-xl bg-[#FDF2F2] border border-[#F5C2C2] text-[#9B2C2C] px-4 py-3 mb-6 text-xs font-sans">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#63574F] font-sans">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                autoComplete="email"
                required
                className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-sm font-sans text-[#382F2A] placeholder:text-[#8B7E76]"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 text-xs font-sans font-semibold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#63574F] font-sans">Verification Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000" 
                maxLength={6}
                required
                className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-2xl font-sans tracking-[0.35em] text-center text-[#382F2A] placeholder:text-[#8B7E76]"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 text-xs font-sans font-semibold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-[#63574F] hover:text-[#382F2A] text-xs font-sans transition-colors py-1"
            >
              Back to email entry
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#63574F] font-sans">Verified Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#EFE7DE]/60 border border-[#D8CBBE] rounded-xl px-4 py-2.5 text-sm font-sans text-[#63574F]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#63574F] font-sans">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
                className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-sm font-sans text-[#382F2A] placeholder:text-[#8B7E76]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#63574F] font-sans">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
                className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-sm font-sans text-[#382F2A] placeholder:text-[#8B7E76]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !fullName.trim() || !phone.trim()}
              className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 text-xs font-sans font-semibold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
