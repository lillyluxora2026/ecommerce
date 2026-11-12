'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, Search, User, Heart, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import { SearchModal } from './SearchModal';
import { CartDrawer } from './CartDrawer';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MarqueeStrip } from './MarqueeStrip';

function subscribeToCartHydration(callback: () => void) {
  const unsubscribeHydrate = useCartStore.persist.onHydrate(callback);
  const unsubscribeFinishHydration = useCartStore.persist.onFinishHydration(callback);

  return () => {
    unsubscribeHydrate();
    unsubscribeFinishHydration();
  };
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const [collectionsDropdown, setCollectionsDropdown] = useState(false);
  const { user, setUser, setSession, setAuthModalOpen } = useUserStore();
  const router = useRouter();

  const cartItemsCount = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );
  const cartHydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
  const visibleCartItemsCount = cartHydrated ? cartItemsCount : 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return;
    setSession(null);
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all duration-300">
        {/* 1. Slim Mocha-Brown Announcement Bar */}
        <MarqueeStrip />

        {/* 2. Main Luxury Navigation Bar */}
        <div
          className={cn(
            'w-full transition-all duration-300 border-b border-[#B7A596]/30',
            scrolled
              ? 'bg-[#F7F3ED]/98 backdrop-blur-md py-3.5 shadow-[0_4px_20px_rgba(56,47,42,0.04)]'
              : 'bg-[#F7F3ED] py-4'
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
            {/* Left: Brand Logo & Wordmark */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Open mobile navigation"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-[#382F2A] hover:text-[#8B7768] p-1"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                href="/"
                className="group flex flex-col items-start leading-none transition-transform hover:opacity-90"
              >
                <div className="flex items-center gap-2">
                  {/* Four-Petal Clover / Floral Monogram */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#8B7768]">
                    <circle cx="9" cy="9" r="4.5" fill="#8B7768" fillOpacity="0.8" />
                    <circle cx="15" cy="9" r="4.5" fill="#C5A574" fillOpacity="0.8" />
                    <circle cx="9" cy="15" r="4.5" fill="#C5A574" fillOpacity="0.8" />
                    <circle cx="15" cy="15" r="4.5" fill="#8B7768" fillOpacity="0.8" />
                    <circle cx="12" cy="12" r="2" fill="#F7F3ED" />
                  </svg>
                  <span className="font-heading text-2xl sm:text-3xl font-normal tracking-[0.06em] text-[#382F2A]">
                    Lily Luxora
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Editorial Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {/* Shop with dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopDropdown(true)}
                onMouseLeave={() => setShopDropdown(false)}
              >
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 text-[13px] font-sans font-medium text-[#382F2A] hover:text-[#8B7768] transition-colors py-2"
                >
                  <span>Shop</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8B7E76]" />
                </Link>

                {shopDropdown && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-[#B7A596]/40 shadow-lg py-2 rounded-sm z-50">
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      All Jewellery
                    </Link>
                    <Link
                      href="/category/necklaces"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      Necklaces
                    </Link>
                    <Link
                      href="/category/earrings"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      Earrings
                    </Link>
                    <Link
                      href="/category/bracelets"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      Bracelets
                    </Link>
                    <Link
                      href="/category/rings"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      Rings
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/products?sort=new"
                className="text-[13px] font-sans font-medium text-[#382F2A] hover:text-[#8B7768] transition-colors py-2"
              >
                New Arrivals
              </Link>

              <Link
                href="/products?sort=featured"
                className="text-[13px] font-sans font-medium text-[#382F2A] hover:text-[#8B7768] transition-colors py-2"
              >
                Bestsellers
              </Link>

              {/* Collections with dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCollectionsDropdown(true)}
                onMouseLeave={() => setCollectionsDropdown(false)}
              >
                <Link
                  href="/category"
                  className="inline-flex items-center gap-1 text-[13px] font-sans font-medium text-[#382F2A] hover:text-[#8B7768] transition-colors py-2"
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8B7E76]" />
                </Link>

                {collectionsDropdown && (
                  <div className="absolute top-full left-0 w-52 bg-white border border-[#B7A596]/40 shadow-lg py-2 rounded-sm z-50">
                    <Link
                      href="/category/necklaces"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      The 18K Gold Edit
                    </Link>
                    <Link
                      href="/category/earrings"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      Waterproof Essentials
                    </Link>
                    <Link
                      href="/category/bracelets"
                      className="block px-4 py-2 text-xs font-sans text-[#382F2A] hover:bg-[#F7F3ED] hover:text-[#8B7768]"
                    >
                      Timeless Stacks
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className="text-[13px] font-sans font-medium text-[#382F2A] hover:text-[#8B7768] transition-colors py-2"
              >
                About
              </Link>
            </nav>

            {/* Right: Utility Icons */}
            <div className="flex items-center gap-5 sm:gap-6">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                title="Search collection"
                aria-label="Search collection"
                className="text-[#382F2A] hover:text-[#8B7768] transition-colors p-1"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
              </button>

              {user ? (
                <Link
                  href="/profile"
                  aria-label="My Account"
                  className="text-[#382F2A] hover:text-[#8B7768] transition-colors p-1"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  aria-label="Sign In"
                  className="text-[#382F2A] hover:text-[#8B7768] transition-colors p-1"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                </button>
              )}

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative text-[#382F2A] hover:text-[#8B7768] transition-colors p-1"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#382F2A] bg-[#F7F3ED] text-[8px] font-sans font-semibold text-[#382F2A]">
                  0
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Shopping Bag"
                className="relative text-[#382F2A] hover:text-[#8B7768] transition-colors p-1"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#382F2A] bg-[#F7F3ED] text-[8px] font-sans font-semibold text-[#382F2A]">
                  {visibleCartItemsCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[70] bg-[#382F2A]/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[80] w-[85vw] max-w-sm bg-[#F7F3ED] border-r border-[#B7A596]/40 p-6 transition-transform duration-300 lg:hidden overflow-y-auto',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-[#B7A596]/30 pb-4">
          <span className="font-heading text-xl text-[#382F2A]">Lily Luxora</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs uppercase tracking-widest text-[#8B7768]"
          >
            Close
          </button>
        </div>

        <nav className="mt-6 space-y-3 font-sans text-sm">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#382F2A] hover:text-[#8B7768]"
          >
            Shop All
          </Link>
          <Link
            href="/category/necklaces"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#382F2A] hover:text-[#8B7768]"
          >
            Necklaces
          </Link>
          <Link
            href="/category/earrings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#382F2A] hover:text-[#8B7768]"
          >
            Earrings
          </Link>
          <Link
            href="/category/bracelets"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#382F2A] hover:text-[#8B7768]"
          >
            Bracelets
          </Link>
          <Link
            href="/category/rings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#382F2A] hover:text-[#8B7768]"
          >
            Rings
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#382F2A] hover:text-[#8B7768]"
          >
            About Us
          </Link>
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="block py-2 text-xs text-red-700 uppercase tracking-wider"
            >
              Sign Out
            </button>
          )}
        </nav>
      </aside>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
