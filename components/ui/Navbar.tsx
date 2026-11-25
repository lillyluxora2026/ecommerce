'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, Search, User, Heart, ChevronDown, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import { SearchModal } from './SearchModal';
import { CartDrawer } from './CartDrawer';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();

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
      setScrolled(window.scrollY > 12);
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
      <header className="sticky top-0 z-50 w-full transition-colors duration-200 bg-white">
        <MarqueeStrip />

        <div
          className={cn(
            'w-full transition-all duration-200 border-b border-[#EBEBEB]',
            scrolled
              ? 'bg-white/95 backdrop-blur-md py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
              : 'bg-white py-3'
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-10">
            {/* Left: Mobile Menu Trigger + Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                aria-label="Open mobile navigation"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-[#121212] hover:opacity-70 p-1.5 -ml-1"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <Link
                href="/"
                className="group flex items-center leading-none transition-opacity hover:opacity-85"
              >
                <Image
                  src="/logo-v2.png"
                  alt="Lily Luxora"
                  width={240}
                  height={68}
                  priority
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Center: Clean Editorial Navigation */}
            <nav aria-label="Primary" className="hidden lg:flex items-center gap-7">
              <div
                className="relative"
                onMouseEnter={() => setShopDropdown(true)}
                onMouseLeave={() => setShopDropdown(false)}
              >
                <Link
                  href="/products"
                  aria-current={pathname === '/products' ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1 text-[13px] font-sans text-[#121212] hover:underline underline-offset-4 py-2',
                    pathname === '/products' && 'underline'
                  )}
                >
                  <span>Shop</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#555555]" strokeWidth={1.5} />
                </Link>

                {shopDropdown && (
                  <div className="absolute top-full left-0 w-52 bg-white border border-[#EBEBEB] shadow-lg py-2 z-50">
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      All Jewellery
                    </Link>
                    <Link
                      href="/category/necklaces"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Necklaces
                    </Link>
                    <Link
                      href="/category/earrings"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Earrings
                    </Link>
                    <Link
                      href="/category/bracelets"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Bracelets
                    </Link>
                    <Link
                      href="/products?maxPrice=1799"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Under Rs. 1,799
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/products?sort=new"
                className="text-[13px] font-sans text-[#121212] hover:underline underline-offset-4 py-2"
              >
                New Arrivals
              </Link>

              <Link
                href="/products?sort=featured"
                className="text-[13px] font-sans text-[#121212] hover:underline underline-offset-4 py-2"
              >
                Bestsellers
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setCollectionsDropdown(true)}
                onMouseLeave={() => setCollectionsDropdown(false)}
              >
                <Link
                  href="/category"
                  aria-current={pathname?.startsWith('/category') ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1 text-[13px] font-sans text-[#121212] hover:underline underline-offset-4 py-2',
                    pathname?.startsWith('/category') && 'underline'
                  )}
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#555555]" strokeWidth={1.5} />
                </Link>

                {collectionsDropdown && (
                  <div className="absolute top-full left-0 w-56 bg-white border border-[#EBEBEB] shadow-lg py-2 z-50">
                    <Link
                      href="/category/necklaces"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Necklaces &amp; Pendants
                    </Link>
                    <Link
                      href="/category/earrings"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Waterproof Earrings
                    </Link>
                    <Link
                      href="/category/bracelets"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Bracelets &amp; Cuffs
                    </Link>
                    <Link
                      href="/category"
                      className="block px-4 py-2 text-[13px] font-sans text-[#121212] hover:bg-[#F7F7F7]"
                    >
                      Explore All Collections
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/about"
                aria-current={pathname === '/about' ? 'page' : undefined}
                className={cn(
                  'text-[13px] font-sans text-[#121212] hover:underline underline-offset-4 py-2',
                  pathname === '/about' && 'underline'
                )}
              >
                About
              </Link>
            </nav>

            {/* Right: Minimal Utility Icons */}
            <div className="flex items-center gap-3.5 sm:gap-5 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                title="Search collection"
                aria-label="Search collection"
                className="text-[#121212] hover:opacity-65 transition-opacity p-1.5"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              {user ? (
                <Link
                  href="/profile"
                  aria-label="My Account"
                  className="text-[#121212] hover:opacity-65 transition-opacity p-1.5"
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  aria-label="Sign In"
                  className="text-[#121212] hover:opacity-65 transition-opacity p-1.5"
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
              )}

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative hidden sm:inline-flex text-[#121212] hover:opacity-65 transition-opacity p-1.5"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Shopping Bag"
                className="relative text-[#121212] hover:opacity-65 transition-opacity p-1.5"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {visibleCartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#121212] px-1 text-[10px] font-sans font-medium text-white tabular-nums">
                    {visibleCartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        aria-label="Mobile navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-[80] w-[85vw] max-w-sm bg-white border-r border-[#EBEBEB] p-6 transition-transform duration-300 lg:hidden overflow-y-auto',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/logo-v2.png"
              alt="Lily Luxora"
              width={160}
              height={46}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
            className="p-2 text-[#121212] hover:bg-[#F5F5F5]"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="mt-6 space-y-1 font-sans text-[15px]">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            Shop All
          </Link>
          <Link
            href="/category/necklaces"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            Necklaces
          </Link>
          <Link
            href="/category/earrings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            Earrings
          </Link>
          <Link
            href="/category/bracelets"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            Bracelets
          </Link>
          <Link
            href="/products?maxPrice=1799"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            Under Rs. 1,799
          </Link>
          <Link
            href="/category"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            Collections
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            Wishlist
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-[#121212] border-b border-[#F3F3F3]"
          >
            About Us
          </Link>
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full text-left py-2.5 text-sm text-red-700"
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
