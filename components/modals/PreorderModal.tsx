'use client';

import { X, Clock } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { NoticeBanner } from '@/components/ui/NoticeBanner';

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    expectedDate?: string;
  };
  onConfirm: (details: { email: string; name: string; phone: string }) => Promise<void>;
  error?: string | null;
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
  loading?: boolean;
}

export function PreorderModal({
  isOpen,
  onClose,
  product,
  onConfirm,
  error,
  defaultEmail,
  defaultName,
  defaultPhone,
  loading = false,
}: PreorderModalProps) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [name, setName] = useState(defaultName || '');
  const [phone, setPhone] = useState(defaultPhone || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({ email, name, phone });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#382F2A]/50 backdrop-blur-sm animate-in fade-in px-4">
      <div className="w-full max-w-md rounded-3xl bg-[#F7F3ED] border border-[#D8CBBE] flex flex-col p-6 sm:p-7 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D8CBBE] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#C5A574]" />
            <h2 className="text-xl sm:text-2xl font-heading font-normal italic text-[#382F2A]">Reserve Preorder</h2>
          </div>
          <button type="button" aria-label="Close preorder dialog" onClick={onClose} className="p-2 rounded-full text-[#63574F] hover:text-[#382F2A] hover:bg-[#EFE7DE] transition-colors -mr-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6 rounded-2xl bg-white border border-[#E5DACF] p-3.5">
          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#EFE7DE] shrink-0 border border-[#D8CBBE]/60">
             <Image src={product.image || '/images/placeholders/product-fallback.svg'} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-heading text-lg text-[#382F2A] leading-snug">{product.name}</h3>
            <p className="font-sans text-sm font-semibold text-[#382F2A] mt-0.5">₹{product.price.toFixed(0)}</p>
            <p className="font-sans text-xs mt-1.5 text-[#8B7768] font-medium">Expected Dispatch: {product.expectedDate || 'Late next month'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-sans mt-1">
          <p className="text-xs sm:text-sm text-[#63574F] leading-relaxed mb-3">
            This piece is currently crafted to order. Reserve yours now and we will notify you as soon as it is ready to ship.
          </p>

          {error && (
            <NoticeBanner tone="error">
              {error}
            </NoticeBanner>
          )}
          
          <input
            required
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
          />

          <input
            required
            type="email"
            placeholder="Enter your email to reserve"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
          />

          <input
            required
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
          />
          
          <button
            type="submit"
            disabled={!name || !email || !phone || loading}
            className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Reserving...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
