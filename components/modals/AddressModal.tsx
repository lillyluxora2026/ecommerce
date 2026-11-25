'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { CustomerAddress, CustomerAddressInput } from '@/lib/customer-addresses';
import { INDIA_STATES } from '@/lib/india-states';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: CustomerAddressInput) => Promise<void> | void;
  initialAddress?: CustomerAddress | null;
  loading?: boolean;
  error?: string | null;
}

const emptyAddress: CustomerAddressInput = {
  fullName: '',
  phone: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

function getInitialFormData(initialAddress?: CustomerAddress | null): CustomerAddressInput {
  return initialAddress
    ? {
        fullName: initialAddress.fullName,
        phone: initialAddress.phone,
        addressLine: initialAddress.addressLine,
        city: initialAddress.city,
        state: initialAddress.state,
        pincode: initialAddress.pincode,
        isDefault: initialAddress.isDefault,
      }
    : emptyAddress;
}

function AddressModalForm({
  onClose,
  onSave,
  initialAddress,
  loading,
  error,
}: Omit<AddressModalProps, 'isOpen'>) {
  const [formData, setFormData] = useState<CustomerAddressInput>(() => getInitialFormData(initialAddress));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-[#EBEBEB] flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB] bg-white">
        <h2 className="text-lg font-sans font-medium text-[#121212]">
          {initialAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
        </h2>
        <button type="button" aria-label="Close address dialog" onClick={onClose} className="p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors" disabled={loading}>
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm font-sans overflow-y-auto">
        {error ? <p className="bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-800">{error}</p> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
          />
          <input
            required
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
          />
        </div>

        <input
          required
          placeholder="Address Line"
          value={formData.addressLine}
          onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
          className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            required
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
          />
          <select
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212]"
          >
            <option value="" className="bg-white text-[#555555]">Select State</option>
            {INDIA_STATES.map((state) => (
              <option key={state} value={state} className="bg-white text-[#121212]">
                {state}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Pincode / ZIP"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
          />
        </div>

        <label className="flex items-center gap-3 text-xs sm:text-sm text-[#555555] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={Boolean(formData.isDefault)}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="h-4 w-4 accent-[#121212]"
          />
          <span>Set as default delivery address</span>
        </label>

        <div className="flex flex-col md:flex-row gap-3 pt-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 text-xs sm:text-[13px] font-medium tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialAddress ? 'Update address' : 'Save address'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-[#D4D4D4] bg-white hover:border-[#121212] text-[#121212] py-3.5 text-xs sm:text-[13px] font-medium tracking-wide transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialAddress,
  loading = false,
  error = null,
}: AddressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] animate-in fade-in px-4">
      <AddressModalForm
        key={initialAddress?.id ?? 'new-address'}
        onClose={onClose}
        onSave={onSave}
        initialAddress={initialAddress}
        loading={loading}
        error={error}
      />
    </div>
  );
}
