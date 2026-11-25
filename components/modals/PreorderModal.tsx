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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] animate-in fade-in px-4">
      <div className="w-full max-w-md bg-white border border-[#EBEBEB] flex flex-col p-6 sm:p-7 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
            <h2 className="text-lg font-sans font-medium text-[#121212]">Reserve Preorder</h2>
          </div>
          <button type="button" aria-label="Close preorder dialog" onClick={onClose} className="p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors -mr-1">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex gap-4 mb-5 bg-[#FAFAFA] border border-[#EBEBEB] p-3.5">
          <div className="relative w-20 h-20 overflow-hidden bg-[#F3F3F3] shrink-0">
             <Image src={product.image || '/images/placeholders/product-fallback.svg'} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-sans text-sm font-medium text-[#121212] leading-snug">{product.name}</h3>
            <p className="font-sans text-sm text-[#121212] mt-0.5">Rs. {product.price.toLocaleString('en-IN')}</p>
            <p className="font-sans text-xs mt-1 text-[#555555]">Expected Dispatch: {product.expectedDate || 'Late next month'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm font-sans mt-1">
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed mb-2">
            This piece is crafted to order. Reserve yours now and we will notify you when ready to ship.
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
            className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
          />

          <input
            required
            type="email"
            placeholder="Enter your email to reserve"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
          />

          <input
            required
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373]"
          />

          <button
            type="submit"
            disabled={!name || !email || !phone || loading}
            className="w-full bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 text-xs sm:text-[13px] font-medium tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Reserving...' : 'Confirm reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
