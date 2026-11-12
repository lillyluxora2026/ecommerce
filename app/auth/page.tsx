'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCustomerProfileState, saveCustomerProfile } from '@/lib/api/customer';
import { useUserStore } from '@/store/userStore';
import { useCartStore } from '@/store/cartStore';
import type { User } from '@supabase/supabase-js';

function AuthPageFallback() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen flex flex-col justify-center items-center py-24 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E5DACF] shadow-xs text-center">
        <p className="text-sm font-sans text-[#63574F] animate-pulse">Loading sign in...</p>
      </div>
    </main>
  );
}

function AuthPageContent() {
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
  const { setUser, setSession } = useUserStore();
  const { syncCart } = useCartStore();
  const redirectPath = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    let cancelled = false;

    const resumeAuthenticatedUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user || cancelled) return;

      const profile = await getCustomerProfileState(session.user);
      if (cancelled) return;

      setUser(session.user);
      setSession(session);
      setEmail(session.user.email ?? '');

      if (profile.needsOnboarding) {
        setVerifiedUser(session.user);
        setFullName(profile.fullName);
        setPhone(profile.phone);
        setStep('profile');
        return;
      }

      router.replace(redirectPath);
    };

    void resumeAuthenticatedUser();

    return () => {
      cancelled = true;
    };
  }, [redirectPath, router, setSession, setUser]);

  const completeSignIn = async (user: User, shouldSyncCart = true) => {
    const profile = await getCustomerProfileState(user);

    if (profile.needsOnboarding) {
      setVerifiedUser(user);
      setFullName(profile.fullName);
      setPhone(profile.phone);
      setStep('profile');
      return;
    }

    if (shouldSyncCart) {
      await syncCart(user);
    }

    router.push(redirectPath);
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
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen flex flex-col justify-center items-center py-20 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#E5DACF] shadow-sm relative">
        <span className="text-[#8B7768] uppercase tracking-[0.22em] text-xs font-sans font-medium block mb-2 text-center">
          Lily Luxora Concierge
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-normal tracking-tight text-[#382F2A] text-center mb-2">
          {step === 'profile' ? 'Complete Your Profile' : 'Sign In to Lily Luxora'}
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] text-center mb-8 leading-relaxed">
          {step === 'email'
            ? 'Enter your email address to receive a secure passwordless sign-in code.'
            : step === 'otp'
              ? `Enter the 6-digit verification code sent to ${email}`
              : 'Complete your profile details to easily manage your orders and shipping addresses.'}
        </p>

        {error && (
          <div className="bg-[#FDF2F2] border border-[#F5C2C2] text-[#9B2C2C] p-3 rounded-xl mb-6 text-xs font-sans">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#63574F] font-sans">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                autoComplete="email"
                required
                className="w-full bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans text-[#382F2A] outline-none focus:border-[#8B7768] transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 px-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send Login Code'}
            </button>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#63574F] font-sans text-center block">Verification Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000" 
                maxLength={6}
                required
                className="w-full bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-2xl tracking-[0.3em] text-center font-sans font-bold text-[#382F2A]"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 px-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-[#63574F] hover:text-[#382F2A] text-xs font-sans transition-colors py-2 text-center"
            >
              ← Back to email entry
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompleteProfile} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#63574F] font-sans">Verified Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#F7F3ED]/50 border border-[#B7A596]/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans text-[#8B7E76]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#63574F] font-sans">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
                className="w-full bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans text-[#382F2A] outline-none focus:border-[#8B7768] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#63574F] font-sans">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
                className="w-full bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans text-[#382F2A] outline-none focus:border-[#8B7768] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !fullName.trim() || !phone.trim()}
              className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 px-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}
