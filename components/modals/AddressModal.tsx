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
    <div className="w-full max-w-2xl rounded-3xl bg-[#F7F3ED] border border-[#D8CBBE] flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#D8CBBE] bg-[#EFE7DE]/60">
        <h2 className="text-xl sm:text-2xl font-heading font-normal italic text-[#382F2A]">
          {initialAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
        </h2>
        <button type="button" aria-label="Close address dialog" onClick={onClose} className="p-2 rounded-full text-[#63574F] hover:text-[#382F2A] hover:bg-[#D8CBBE]/40 transition-colors" disabled={loading}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm font-sans overflow-y-auto">
        {error ? <p className="rounded-xl bg-[#FDF2F2] border border-[#F5C2C2] px-4 py-2.5 text-xs text-[#9B2C2C]">{error}</p> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
          />
          <input
            required
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
          />
        </div>

        <input
          required
          placeholder="Address Line"
          value={formData.addressLine}
          onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
          className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            required
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
          />
          <select
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]"
          >
            <option value="" className="bg-white text-[#63574F]">Select State</option>
            {INDIA_STATES.map((state) => (
              <option key={state} value={state} className="bg-white text-[#382F2A]">
                {state}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Pincode / ZIP"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
          />
        </div>

        <label className="flex items-center gap-3 text-xs sm:text-sm text-[#63574F] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={Boolean(formData.isDefault)}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="h-4 w-4 accent-[#6D5C50] rounded border-[#B7A596]"
          />
          <span>Set as default delivery address</span>
        </label>

        <div className="flex flex-col md:flex-row gap-3 pt-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialAddress ? 'Update Address' : 'Save Address'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-[#B7A596] bg-white hover:bg-[#EFE7DE] text-[#382F2A] py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors disabled:opacity-50"
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#382F2A]/50 backdrop-blur-sm animate-in fade-in px-4">
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
