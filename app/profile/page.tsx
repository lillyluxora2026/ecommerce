'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddressModal } from '@/components/modals/AddressModal';
import type { CustomerAddress, CustomerAddressInput } from '@/lib/customer-addresses';
import { createCustomerAddress, getCustomerAddresses, updateCustomerAddress } from '@/lib/api/customer-addresses';
import { getCustomerProfileState, saveCustomerProfile } from '@/lib/api/customer';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, setSession, setAuthModalOpen } = useUserStore();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState<string | null>(null);
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [draftFullName, setDraftFullName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user) {
        setFullName('');
        setPhone('');
        setDraftFullName('');
        setDraftPhone('');
        setAddresses([]);
        return;
      }

      setAddressesLoading(true);
      setAddressesError(null);

      try {
        const [profile, savedAddresses] = await Promise.all([
          getCustomerProfileState(user),
          getCustomerAddresses(),
        ]);

        if (cancelled) return;

        setFullName(profile.fullName);
        setPhone(profile.phone);
        setDraftFullName(profile.fullName);
        setDraftPhone(profile.phone);
        setAddresses(savedAddresses);
      } catch (err: unknown) {
        if (cancelled) return;

        const errorMsg = err instanceof Error ? err.message : 'Could not load your profile.';
        setAddressesError(errorMsg);
      } finally {
        if (!cancelled) {
          setAddressesLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
          Customer Account
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
          Access Your Profile
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-sm mb-8 leading-relaxed">
          Please log in to manage your saved addresses and view order status.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all shadow-sm"
        >
          Sign In
        </button>
      </main>
    );
  }

  const handleStartEditProfile = () => {
    setDraftFullName(fullName);
    setDraftPhone(phone);
    setProfileError(null);
    setProfileSuccess(null);
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setDraftFullName(fullName);
    setDraftPhone(phone);
    setProfileError(null);
    setProfileSuccess(null);
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await saveCustomerProfile(user, {
        fullName: draftFullName,
        phone: draftPhone,
      });

      const updatedProfile = await getCustomerProfileState(user);
      setFullName(updatedProfile.fullName);
      setPhone(updatedProfile.phone);
      setDraftFullName(updatedProfile.fullName);
      setDraftPhone(updatedProfile.phone);
      setIsEditingProfile(false);
      setProfileSuccess('Profile updated.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile.';
      setProfileError(errorMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressModalError(null);
    setAddressModalOpen(true);
  };

  const openEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setAddressModalError(null);
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    if (addressSaving) return;

    setAddressModalOpen(false);
    setEditingAddress(null);
    setAddressModalError(null);
  };

  const handleSaveAddress = async (input: CustomerAddressInput) => {
    setAddressSaving(true);
    setAddressModalError(null);
    setAddressSuccess(null);

    try {
      const savedAddress = editingAddress
        ? await updateCustomerAddress(editingAddress.id, input)
        : await createCustomerAddress(input);

      setAddresses((current) => {
        const withoutOld = current.filter((address) => address.id !== savedAddress.id);
        const next = [savedAddress, ...withoutOld];
        return savedAddress.isDefault
          ? next.map((address) => ({
              ...address,
              isDefault: address.id === savedAddress.id,
            }))
          : next;
      });

      setAddressSuccess(editingAddress ? 'Address updated.' : 'Address added.');
      setAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Could not save address.';
      setAddressModalError(errorMsg);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign out.';
      setSignOutError(errorMsg);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
          <div className="border-b border-[#B7A596]/40 pb-6 mb-8">
            <span className="text-[#8B7768] uppercase tracking-[0.22em] text-xs font-sans font-medium block mb-1">
              Account Overview
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-normal tracking-tight text-[#382F2A]">
              My Profile
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            <aside className="col-span-1 space-y-3 font-sans text-xs sm:text-sm">
              <Link href="/profile" className="block text-[#8B7768] font-semibold bg-[#EFE7DE] px-4 py-2.5 rounded-xl border border-[#D8CBBE]">Dashboard</Link>
              <Link href="/orders" className="block text-[#63574F] hover:text-[#382F2A] px-4 py-2.5 rounded-xl transition-colors">Order History</Link>
              <Link href="/wishlist" className="block text-[#63574F] hover:text-[#382F2A] px-4 py-2.5 rounded-xl transition-colors">Wishlist</Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="block text-[#8B7E76] hover:text-red-600 transition-colors mt-6 pt-6 border-t border-[#B7A596]/30 w-full text-left px-4 disabled:opacity-50"
              >
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
              {signOutError ? <p className="text-xs text-red-500 px-4">{signOutError}</p> : null}
            </aside>

            <section className="col-span-1 md:col-span-3 space-y-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DACF] shadow-xs">
                <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-6">Account Details</h2>
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {profileError ? <p className="text-xs text-red-500">{profileError}</p> : null}
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#63574F] font-sans">Full Name</label>
                      <input
                        type="text"
                        value={draftFullName}
                        onChange={(e) => setDraftFullName(e.target.value)}
                        autoComplete="name"
                        required
                        className="w-full bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans text-[#382F2A] outline-none focus:border-[#8B7768] transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#63574F] font-sans">Email</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full bg-[#F7F3ED]/50 border border-[#B7A596]/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans text-[#8B7E76]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#63574F] font-sans">Phone Number</label>
                      <input
                        type="tel"
                        value={draftPhone}
                        onChange={(e) => setDraftPhone(e.target.value)}
                        autoComplete="tel"
                        required
                        className="w-full bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans text-[#382F2A] outline-none focus:border-[#8B7768] transition-colors"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={profileLoading || !draftFullName.trim() || !draftPhone.trim()}
                        className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-medium tracking-wide transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {profileLoading ? 'Saving...' : 'Save Profile'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditProfile}
                        disabled={profileLoading}
                        className="rounded-full border border-[#B7A596] hover:border-[#8B7768] px-6 py-2.5 text-xs font-sans font-medium text-[#63574F] transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
              ) : (
                <>
                  {profileSuccess ? <p className="mb-4 text-sm text-[#2C6E49] font-sans">{profileSuccess}</p> : null}
                  {profileError ? <p className="mb-4 text-sm text-[#A63A3A] font-sans">{profileError}</p> : null}
                  <div className="space-y-4 text-sm font-sans text-[#382F2A]">
                    <div>
                      <span className="text-[#8B7E76] w-32 inline-block">Name:</span>
                      <span>{fullName || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[#8B7E76] w-32 inline-block">Email:</span>
                      <span>{user.email || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[#8B7E76] w-32 inline-block">Phone:</span>
                      <span>{phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[#8B7E76] w-32 inline-block">Login Method:</span>
                      <span>Email OTP</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartEditProfile}
                    className="mt-8 rounded-full border border-[#B7A596] bg-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-medium text-[#382F2A] hover:border-[#6D5C50] hover:bg-[#6D5C50] hover:text-[#F7F3ED] transition-colors"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 md:p-8 border border-[#E5DACF] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-heading font-normal text-[#382F2A]">Saved Addresses</h2>
                  <p className="text-sm font-sans text-[#63574F] mt-2">
                    Use the same address book on checkout for faster ordering.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddAddress}
                  className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-medium transition-colors shadow-xs"
                >
                  Add Address +
                </button>
              </div>

              {addressSuccess ? <p className="mb-4 text-sm text-[#2C6E49] font-sans">{addressSuccess}</p> : null}
              {addressesError ? <p className="mb-4 text-sm text-[#A63A3A] font-sans">{addressesError}</p> : null}

              {addressesLoading ? (
                <p className="text-[#8B7E76] text-sm font-sans">Loading saved addresses...</p>
              ) : addresses.length === 0 ? (
                <p className="text-[#8B7E76] text-sm font-sans">You have no saved addresses yet.</p>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="rounded-2xl border border-[#E5DACF] bg-[#F7F3ED]/60 p-5 text-sm font-sans">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 text-[#63574F]">
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-[#382F2A]">{address.fullName}</p>
                            {address.isDefault ? (
                              <span className="rounded-full bg-[#EFE7DE] border border-[#D8CBBE] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6D5C50]">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <p>{address.phone}</p>
                          <p>{address.addressLine}</p>
                          <p>{address.city}, {address.state} {address.pincode}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditAddress(address)}
                          className="rounded-full border border-[#B7A596] bg-white px-4 py-1.5 text-xs font-medium text-[#382F2A] hover:border-[#6D5C50] hover:bg-[#6D5C50] hover:text-[#F7F3ED] transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        </div>
      </main>

      <AddressModal
        isOpen={addressModalOpen}
        onClose={closeAddressModal}
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
        loading={addressSaving}
        error={addressModalError}
      />
    </>
  );
}
