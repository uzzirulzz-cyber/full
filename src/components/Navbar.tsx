import {
  Briefcase,
  Bot,
  LogIn,
  LogOut,
  Menu,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tv,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type ActiveView = 'digital-store' | 'business-services' | 'live-tv' | 'ai-chat' | 'admin';

interface NavbarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  cartPopKey: number;
  onOpenCart: () => void;
  adminBadgeCount: number;
  onShowToast: (msg: string) => void;
}

export function Navbar({
  activeView,
  onSelectView,
  searchQuery,
  onSearchChange,
  cartCount,
  cartPopKey,
  onOpenCart,
  adminBadgeCount,
  onShowToast,
}: NavbarProps) {
  const { user, openAuthModal, signOutUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const buyerPages: Array<{
    id: Exclude<ActiveView, 'admin'>;
    label: string;
    icon: typeof ShoppingBag;
    liveDot?: boolean;
  }> = [
    { id: 'digital-store', label: 'Digital Store', icon: ShoppingBag },
    { id: 'business-services', label: 'Business Services', icon: Briefcase },
    { id: 'live-tv', label: 'LIVE TV', icon: Tv, liveDot: true },
    { id: 'ai-chat', label: 'AI Chat Box', icon: Bot },
  ];

  const searchPlaceholder =
    activeView === 'business-services'
      ? 'Search services...'
      : activeView === 'live-tv'
        ? 'Search live channels...'
        : activeView === 'ai-chat'
          ? 'PlayBeat AI Studio'
          : 'Search digital products...';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeView === 'admin') {
      onSelectView('digital-store');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onShowToast('Signed out of Playbeat Digital.');
  };

  const userDisplay =
    user?.displayName ||
    user?.phoneNumber ||
    (user?.email ? user.email.split('@')[0] : 'Account');

  return (
    <header
      id="home"
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled || activeView !== 'digital-store' ? 'pb-header-scrolled' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          <button
            type="button"
            onClick={() => onSelectView('digital-store')}
            className="shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffc928] rounded"
            aria-label="Playbeat Digital Home"
          >
            <img
              src="/assets/playbeat/logo-header.webp"
              width={240}
              height={56}
              alt="Playbeat Digital"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </button>

          <span className="hidden lg:block h-7 w-px bg-[#1d4ed8]" />

          <nav
            className="hidden lg:flex items-center gap-1.5 text-[12px] font-semibold flex-1"
            aria-label="Storefront navigation"
          >
            {buyerPages.map((page) => {
              const Icon = page.icon;
              const isActive = activeView === page.id;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => onSelectView(page.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 h-[32px] transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'cat-active text-white border border-[#2f8bff]'
                      : 'text-[#f2f6ff] hover:text-[#1ea0ff] hover:bg-[#0b2a8a55]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? 'text-[#ffd958]' : 'text-[#1ea0ff]'}`}
                    aria-hidden="true"
                  />
                  <span>{page.label}</span>
                  {page.liveDot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            {activeView !== 'admin' && (
              <form
                onSubmit={handleSearchSubmit}
                role="search"
                className="hidden xl:flex items-center gap-2 ob rounded-full pl-3 pr-3 h-[32px] w-[170px] bg-[#030a1f99]"
              >
                <Search className="w-3.5 h-3.5 shrink-0 text-[#c8d3ea]" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Search Playbeat"
                  className="bg-transparent outline-none w-full text-[11px] text-[#f2f6ff] placeholder:text-[#cfd8ee]"
                />
              </form>
            )}

            {/* Firebase Auth Account Button */}
            {user ? (
              <div className="hidden sm:inline-flex items-center gap-1.5 ob rounded-full pl-2 pr-1.5 h-[32px] bg-[#030a1f99]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={userDisplay}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-[#ffd958]"
                  />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#ffd958]" />
                )}
                <span className="text-[11px] font-bold text-[#f2f6ff] max-w-[90px] truncate">
                  {userDisplay}
                </span>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  aria-label="Sign out"
                  title="Sign Out"
                  className="w-6 h-6 rounded-full hover:bg-rose-500/20 grid place-items-center text-[#c8d3ea] hover:text-rose-300 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="hidden sm:inline-flex items-center gap-1.5 yb rounded-full px-3.5 h-[32px] text-[11px] font-bold whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign Up</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.location.assign('https://admin.playbeat.digital/admin')}
              aria-current={activeView === 'admin' ? 'page' : undefined}
              className={`hidden md:inline-flex items-center gap-1.5 rounded-full px-3 h-[32px] text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'admin'
                  ? 'bg-[#ffd958] text-[#030a1f]'
                  : 'ob bg-[#030a1f99] text-[#f2f6ff] hover:bg-[#0b2a8a]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Admin</span>
              {adminBadgeCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeView === 'admin'
                      ? 'bg-[#030a1f]/15 text-[#030a1f]'
                      : 'bg-[#1ea0ff]/25 text-[#ffd958]'
                  }`}
                >
                  {adminBadgeCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open cart, ${cartCount} items`}
              className="relative p-1 text-[#f2f6ff] hover:text-[#ffd958] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  key={cartPopKey}
                  className="pb-pop absolute -top-1.5 -right-2 bg-[#1ea0ff] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 grid place-items-center font-mono tabular-nums"
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
              className="lg:hidden p-1 text-[#f2f6ff] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-3">
            <nav
              className="edge rounded-xl p-4 flex flex-col gap-3 text-sm font-semibold"
              aria-label="Mobile"
            >
              {buyerPages.map((page) => {
                const Icon = page.icon;
                const isActive = activeView === page.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      onSelectView(page.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left flex items-center justify-between py-1 transition-colors cursor-pointer ${
                      isActive ? 'text-[#ffd958]' : 'text-[#f2f6ff] hover:text-[#1ea0ff]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#1ea0ff]" />
                      {page.label}
                      {page.liveDot && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    </span>
                  </button>
                );
              })}

              {/* Mobile Auth Row */}
              <div className="border-t border-[#1d4ed855] pt-2.5 flex items-center justify-between gap-2">
                {user ? (
                  <>
                    <span className="text-xs text-[#ffd958] font-bold truncate">
                      Signed in: {userDisplay}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        void handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="ob rounded-full px-3 py-1 text-xs text-rose-300 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openAuthModal();
                      setMobileMenuOpen(false);
                    }}
                    className="yb rounded-full h-9 w-full text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign Up / Sign In
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.assign('https://admin.playbeat.digital/admin');
                  setMobileMenuOpen(false);
                }}
                className={`text-left flex items-center justify-between py-1.5 border-t border-[#1d4ed855] pt-2.5 cursor-pointer ${
                  activeView === 'admin' ? 'text-[#ffd958]' : 'text-[#c8d3ea] hover:text-[#ffd958]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#ffd958]" />
                  Admin Panel
                </span>
                {adminBadgeCount > 0 && (
                  <span className="rounded-full bg-[#1ea0ff]/20 px-2 py-0.5 text-xs text-[#ffd958] font-mono">
                    {adminBadgeCount}
                  </span>
                )}
              </button>

              {activeView !== 'admin' && (
                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setMobileMenuOpen(false);
                  }}
                  role="search"
                  className="xl:hidden flex items-center gap-2 ob rounded-full px-3 h-9 bg-[#030a1f99] mt-1"
                >
                  <Search className="w-4 h-4 shrink-0 text-[#c8d3ea]" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label="Search Playbeat"
                    className="bg-transparent outline-none w-full text-xs text-[#f2f6ff]"
                  />
                </form>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
