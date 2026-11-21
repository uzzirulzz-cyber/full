import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Crown,
  Diamond,
  Flame,
  Gamepad2,
  Globe,
  Headphones,
  KeyRound,
  Laptop,
  LayoutGrid,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tv,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../types/store';
import type { ActiveView } from './Navbar';
import { ProductCard } from './ProductCard';

type CategoryFilterId =
  | 'all'
  | 'PC Games'
  | 'Console Subscriptions'
  | 'Gift Cards'
  | 'Software Keys'
  | 'Security & VPN'
  | 'deals'
  | 'under25';

type ProductSort = 'featured' | 'discount' | 'price-asc' | 'price-desc' | 'name';

interface StorefrontViewProps {
  digitalProducts: Product[];
  servicesCount: number;
  liveChannelsCount: number;
  searchQuery: string;
  onClearSearch: () => void;
  onAddToCart: (sku: string) => void;
  onInspectProduct: (product: Product) => void;
  onSelectView: (view: ActiveView) => void;
  onShowToast: (msg: string) => void;
}

const PAGE_SIZE = 24;

const CATEGORY_TABS: Array<{
  id: CategoryFilterId;
  label: string;
  description: string;
  icon: typeof Gamepad2;
  iconClass: string;
}> = [
  {
    id: 'all',
    label: 'All Digital',
    description: 'The complete Playbeat digital collection',
    icon: LayoutGrid,
    iconClass: 'bg-blue-400/10 text-blue-300 ring-blue-300/20',
  },
  {
    id: 'PC Games',
    label: 'PC Game Keys',
    description: 'Steam, EA App and PC gaming favorites',
    icon: Gamepad2,
    iconClass: 'bg-violet-400/10 text-violet-300 ring-violet-300/20',
  },
  {
    id: 'Console Subscriptions',
    label: 'Console & Pass',
    description: 'Xbox and PlayStation memberships',
    icon: Zap,
    iconClass: 'bg-cyan-400/10 text-cyan-300 ring-cyan-300/20',
  },
  {
    id: 'Gift Cards',
    label: 'Gift Cards',
    description: 'Wallet top-ups and digital gift cards',
    icon: CreditCard,
    iconClass: 'bg-amber-400/10 text-amber-300 ring-amber-300/20',
  },
  {
    id: 'Software Keys',
    label: 'Software & OS',
    description: 'Windows, Office and essential software',
    icon: Laptop,
    iconClass: 'bg-emerald-400/10 text-emerald-300 ring-emerald-300/20',
  },
  {
    id: 'Security & VPN',
    label: 'Security & VPN',
    description: 'Antivirus, privacy and VPN protection',
    icon: ShieldCheck,
    iconClass: 'bg-rose-400/10 text-rose-300 ring-rose-300/20',
  },
  {
    id: 'deals',
    label: 'Top Deals 40%+',
    description: 'Premium picks discounted by at least 40%',
    icon: Flame,
    iconClass: 'bg-orange-400/10 text-orange-300 ring-orange-300/20',
  },
  {
    id: 'under25',
    label: 'Under $25 Keys',
    description: 'Budget-friendly digital keys under $25',
    icon: KeyRound,
    iconClass: 'bg-teal-400/10 text-teal-300 ring-teal-300/20',
  },
];

export function StorefrontView({
  digitalProducts,
  servicesCount,
  liveChannelsCount,
  searchQuery,
  onClearSearch,
  onAddToCart,
  onInspectProduct,
  onSelectView,
  onShowToast,
}: StorefrontViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterId>('all');
  const [sortBy, setSortBy] = useState<ProductSort>('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, searchQuery, sortBy]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return digitalProducts.filter((p) => {
      const matchesCat =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'deals'
            ? p.discountPercent >= 40
            : selectedCategory === 'under25'
              ? p.priceUsd <= 25
              : p.category === selectedCategory;

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.publicCode || '').toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [digitalProducts, selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilterId, number> = {
      all: digitalProducts.length,
      'PC Games': 0,
      'Console Subscriptions': 0,
      'Gift Cards': 0,
      'Software Keys': 0,
      'Security & VPN': 0,
      deals: 0,
      under25: 0,
    };

    digitalProducts.forEach((product) => {
      counts[product.category] += 1;
      if (product.discountPercent >= 40) counts.deals += 1;
      if (product.priceUsd <= 25) counts.under25 += 1;
    });

    return counts;
  }, [digitalProducts]);

  const displayedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.priceUsd - b.priceUsd;
        case 'price-desc':
          return b.priceUsd - a.priceUsd;
        case 'discount':
          return b.discountPercent - a.discountPercent;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return (
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            b.discountPercent - a.discountPercent ||
            a.name.localeCompare(b.name)
          );
      }
    });
  }, [filteredProducts, sortBy]);

  const activeCategory = CATEGORY_TABS.find((tab) => tab.id === selectedCategory) || CATEGORY_TABS[0];
  const activeCategoryLabel = searchQuery.trim()
    ? `${filteredProducts.length.toLocaleString()} results for “${searchQuery.trim()}” in ${activeCategory.label}.`
    : `${activeCategory.description} · ${filteredProducts.length.toLocaleString()} products available.`;
  const visibleProducts = displayedProducts.slice(0, visibleCount);
  const loadingProgress = displayedProducts.length
    ? Math.min(100, (visibleProducts.length / displayedProducts.length) * 100)
    : 0;

  const handleCategoryClick = (id: CategoryFilterId) => {
    setSelectedCategory(id);
    document.getElementById('digital-products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ══════════════ HERO SECTION (Landing Page: Digital Store & Products) ══════════════ */}
      <section className="relative overflow-hidden -mt-16 pt-16">
        <svg
          className="absolute left-0 top-12 w-full h-20 pointer-events-none"
          viewBox="0 0 1240 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 40C260 85 520 25 1240 8"
            fill="none"
            stroke="#3b8bff"
            strokeWidth="1.6"
            opacity=".7"
          />
        </svg>

        <img
          src="/assets/playbeat/hero-wave.webp"
          width={1024}
          height={60}
          alt=""
          className="absolute inset-x-0 bottom-0 w-full h-[130px] object-fill pointer-events-none brightness-125 saturate-150"
        />

        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.25fr_1fr] gap-4 items-center pt-8 pb-20 relative z-10">
          <div>
            <p className="text-[12px] sm:text-[13px] font-semibold tracking-wide text-[#f2f6ff]">
              PLAYBEAT DIGITAL STORE &amp; WORLDWIDE PRODUCTS
            </p>
            <h1 className="chrome italic font-extrabold leading-[1.08] tracking-tight mt-3 text-[clamp(1.85rem,7vw,2.3rem)] lg:text-[clamp(2rem,3.3vw,2.45rem)] lg:whitespace-nowrap">
              YOUR WORLD OF
              <br />
              DIGITAL POSSIBILITIES
            </h1>
            <p className="mt-4 text-[13px] font-medium text-[#f2f6ff]">
              PC Game Keys &nbsp;•&nbsp; Console Passes &nbsp;•&nbsp; Gift Cards &nbsp;•&nbsp; Software &nbsp;•&nbsp; Security
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#c8d3ea]">
              Instant checkout via Rapid Gateway PKR (JazzCash, EasyPaisa, Bank), PayPal USD, or Manual Transfer.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-3 mt-5 text-[11px] font-medium">
              <span className="flex items-center gap-2">
                <i className="w-9 h-9 rounded-full border border-[#1ea0ff] bg-[#07163f] grid place-items-center text-[#ffc928] not-italic">
                  <ShieldCheck className="w-[18px] h-[18px]" aria-hidden="true" />
                </i>
                <span className="leading-tight">
                  Verified
                  <br />
                  Partners
                </span>
              </span>
              <span className="flex items-center gap-2">
                <i className="w-9 h-9 rounded-full border border-[#1ea0ff] bg-[#07163f] grid place-items-center text-[#ffc928] not-italic">
                  <Zap className="w-[18px] h-[18px]" aria-hidden="true" />
                </i>
                <span className="leading-tight">
                  Instant
                  <br />
                  Delivery
                </span>
              </span>
              <span className="flex items-center gap-2">
                <i className="w-9 h-9 rounded-full border border-[#1ea0ff] bg-[#07163f] grid place-items-center text-[#ffc928] not-italic">
                  <Globe className="w-[18px] h-[18px]" aria-hidden="true" />
                </i>
                <span className="leading-tight">
                  100%
                  <br />
                  Worldwide
                </span>
              </span>
              <span className="flex items-center gap-2">
                <i className="w-9 h-9 rounded-full border border-[#1ea0ff] bg-[#07163f] grid place-items-center text-[#ffc928] not-italic">
                  <Headphones className="w-[18px] h-[18px]" aria-hidden="true" />
                </i>
                <span className="leading-tight">
                  24/7
                  <br />
                  Support
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                document.getElementById('digital-products-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="yb rounded-full px-7 h-10 inline-flex items-center text-[13px] font-bold"
              >
                Explore Products &nbsp;→
              </button>
              <button
                type="button"
                onClick={() => onSelectView('business-services')}
                className="ob rounded-full px-6 h-10 inline-flex items-center gap-1.5 text-[12.5px] font-bold bg-[#030a1f66] hover:bg-[#0b2a8a66] transition-colors cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#ffd958]" />
                Business Services
              </button>
              <button
                type="button"
                onClick={() => onSelectView('live-tv')}
                className="ob rounded-full px-6 h-10 inline-flex items-center gap-1.5 text-[12.5px] font-bold bg-[#030a1f66] hover:bg-[#0b2a8a66] transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                LIVE TV
              </button>
            </div>
          </div>

          <img
            src="/assets/playbeat/hero-showcase.webp"
            width={498}
            height={347}
            alt="Playbeat Digital worldwide storefront showcase"
            className="w-full max-w-[460px] mx-auto lg:ml-auto lg:mr-0 drop-shadow-[0_0_24px_rgba(30,160,255,0.28)]"
          />
        </div>
      </section>


      <main id="main" className="max-w-[1180px] mx-auto px-4 sm:px-6 relative z-10 -mt-14">
        <section className="relative overflow-hidden rounded-[28px] border border-[#4b88e8]/35 bg-[#061230]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-5">
          <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#1677ff]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[#7c3aed]/10 blur-3xl" />

          <div className="relative mb-4 flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#ffd958]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Curated for every digital lifestyle
              </p>
              <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Shop by <span className="text-[#69baff]">category</span>
              </h2>
            </div>
            <p className="text-[11px] font-medium text-[#9fb1d2] sm:text-right">
              {digitalProducts.length.toLocaleString()} products. One secure checkout.
            </p>
          </div>

          <nav
            id="categories"
            aria-label="Digital product categories"
            className="relative grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8"
          >
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryClick(tab.id)}
                  aria-pressed={isActive}
                  aria-label={`${tab.label}, ${categoryCounts[tab.id]} products`}
                  className={`group relative flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-2 py-3 text-center transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd958] motion-reduce:transition-none ${
                    isActive
                      ? 'border-[#69baff]/80 bg-[#123a75]/70 shadow-[0_10px_30px_rgba(14,116,244,0.18),inset_0_1px_0_rgba(255,255,255,0.09)]'
                      : 'border-white/[0.08] bg-white/[0.035] hover:-translate-y-0.5 hover:border-[#69baff]/40 hover:bg-white/[0.065]'
                  }`}
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105 ${tab.iconClass}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className={`text-[10.5px] font-bold leading-tight ${isActive ? 'text-white' : 'text-[#dbe7fb]'}`}>
                    {tab.label}
                  </span>
                  <span className={`font-mono text-[9px] tabular-nums ${isActive ? 'text-[#9ed5ff]' : 'text-[#7188ad]'}`}>
                    {categoryCounts[tab.id].toLocaleString()} items
                  </span>
                  {isActive && (
                    <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#7bc5ff] to-transparent" />
                  )}
                </button>
              );
            })}
          </nav>
        </section>

        <section id="digital-products-grid" className="scroll-mt-24">
          <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#ffd958]">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Premium selection · Verified digital catalogue
              </p>
              <h2 className="mt-2 text-[clamp(1.8rem,5vw,2.65rem)] font-extrabold leading-tight tracking-[-0.035em] text-white">
                {activeCategory.label} <span className="text-[#69baff]">collection</span>
              </h2>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#9fb1d2] sm:text-sm">
                {activeCategoryLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 text-[11px] font-semibold text-[#b5c5df]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                {displayedProducts.length.toLocaleString()} results
              </span>
              <label className="relative">
                <span className="sr-only">Sort digital products</span>
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7cbfff]" aria-hidden="true" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as ProductSort)}
                  className="h-11 cursor-pointer appearance-none rounded-xl border border-[#2f8bff]/35 bg-[#081a3a] pl-9 pr-9 text-[11px] font-bold text-[#e8f2ff] outline-none transition-colors hover:border-[#69baff]/70 focus:border-[#ffd958]"
                >
                  <option value="featured">Featured first</option>
                  <option value="discount">Biggest savings</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7cbfff]" aria-hidden="true" />
              </label>
            </div>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-[#4b88e8]/35 bg-[#071633]/70 px-6 py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#4b88e8]/25 bg-[#0c244c] text-[#79c4ff]">
                <SearchX className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-white">No products found</h3>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#9fb1d2]">
                Try another search or reset the category to explore the complete Playbeat collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  onClearSearch();
                }}
                className="yb mt-5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-5 text-xs font-extrabold"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                Show all products
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product.sku}
                    product={product}
                    priority={index < 4}
                    onAddToCart={onAddToCart}
                    onInspectProduct={onInspectProduct}
                  />
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-[11px] font-medium text-[#8fa5c8]" aria-live="polite">
                  Showing <span className="font-mono font-bold text-white">{visibleProducts.length.toLocaleString()}</span> of{' '}
                  <span className="font-mono font-bold text-white">{displayedProducts.length.toLocaleString()}</span> products
                </p>
                {displayedProducts.length > PAGE_SIZE && (
                  <div className="h-1.5 w-52 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#287df0] to-[#73c5ff] transition-[width] duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                )}
                {visibleProducts.length < displayedProducts.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="ob inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#081a3a]/90 px-6 text-xs font-extrabold text-[#e8f2ff] transition-all hover:-translate-y-0.5 hover:border-[#79c4ff] hover:bg-[#10326a]"
                  >
                    Load {Math.min(PAGE_SIZE, displayedProducts.length - visibleProducts.length)} more products
                    <ChevronDown className="h-4 w-4 text-[#ffd958]" aria-hidden="true" />
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {/* Explore more PlayBeat services and entertainment */}
        <section className="grid md:grid-cols-2 gap-4 mt-10">
          <div className="edge rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#2f8bff] transition-all">
            <div>
              <p className="text-[10.5px] font-bold text-[#ffd958] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                PLAYBEAT.DIGITAL/SERVICES
              </p>
              <h3 className="text-lg font-extrabold text-[#f2f6ff] mt-1">
                Playbeat Business Services
              </h3>
              <p className="text-xs text-[#c8d3ea] mt-1">
                Browse {servicesCount} enterprise websites, e-commerce stores, CRM dashboards &amp; automation packages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectView('business-services')}
              className="yb rounded-full px-5 h-9 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
            >
              Open Services
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="edge rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#2f8bff] transition-all">
            <div>
              <p className="text-[10.5px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-[#ffd958]" />
                EMBEDDED HD STREAMING
              </p>
              <h3 className="text-lg font-extrabold text-[#f2f6ff] mt-1">
                Playbeat LIVE TV
              </h3>
              <p className="text-xs text-[#c8d3ea] mt-1">
                Watch {liveChannelsCount} live broadcast channels directly inside the embedded HD player + 4K streaming passes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectView('live-tv')}
              className="ob rounded-full px-5 h-9 text-xs font-bold bg-[#061236] hover:bg-[#0b2a8a] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              Watch LIVE TV
              <ArrowRight className="w-3.5 h-3.5 text-[#ffd958]" />
            </button>
          </div>
        </section>

        {/* Promotional Banner ("Premium Access Worldwide") */}
        <section className="edge rounded-2xl mt-8 p-6 grid lg:grid-cols-[1fr_1.4fr_.8fr] gap-6 items-center">
          <div>
            <p className="text-[#ffc928] text-[11px] font-bold tracking-wide">
              INSTANT WORLDWIDE ACCESS
            </p>
            <h2 className="text-[26px] sm:text-[28px] font-extrabold leading-[1.1] mt-1">
              Premium Access
              <br />
              Worldwide
            </h2>
            <p className="text-[11.5px] font-medium text-[#c8d3ea] my-3 leading-[1.5]">
              Shop verified Worldwide digital keys with instant delivery via Rapid Gateway PKR, PayPal International, and Manual checkout.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                document.getElementById('digital-products-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="yb rounded-full px-6 h-8 inline-flex items-center text-[12px] font-bold"
            >
              Browse All Keys &nbsp;→
            </button>
          </div>

          <img
            src="/assets/playbeat/promo-showcase.webp"
            width={443}
            height={169}
            alt="Playbeat Digital worldwide access"
            className="w-full max-w-[420px] mx-auto object-contain"
            loading="lazy"
          />

          <ul className="space-y-3">
            {[
              '100% Genuine Worldwide Keys',
              'Instant Digital Key Delivery',
              'Rapid Gateway PKR & PayPal USD',
              'Verified PlayBeat Retail Pricing',
              '24/7 Playbeat Customer Support',
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-[13px]">
                <span className="text-[#ffc928] shrink-0">
                  <CheckCircle2 className="w-[18px] h-[18px]" aria-hidden="true" />
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4-Stat Trust Bar */}
        <section className="edge rounded-2xl mt-5 py-3 grid grid-cols-2 lg:grid-cols-4 gap-y-3">
          <div className="flex items-center justify-center gap-3 py-2 lg:border-r border-[#1d4ed866]">
            <span className="text-[#ffc928]">
              <Users className="w-9 h-9" aria-hidden="true" />
            </span>
            <div>
              <b className="block text-xl leading-tight font-mono tabular-nums">100K+</b>
              <span className="text-[11px] text-[#c8d3ea]">Happy Customers</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-2 lg:border-r border-[#1d4ed866]">
            <span className="text-[#ffc928]">
              <Globe className="w-9 h-9" aria-hidden="true" />
            </span>
            <div>
              <b className="block text-xl leading-tight font-mono tabular-nums">180+</b>
              <span className="text-[11px] text-[#c8d3ea]">Countries Covered</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-2 lg:border-r border-[#1d4ed866]">
            <span className="text-[#ffc928]">
              <Zap className="w-9 h-9" aria-hidden="true" />
            </span>
            <div>
              <b className="block text-xl leading-tight font-mono tabular-nums">99%</b>
              <span className="text-[11px] text-[#c8d3ea]">Positive Reviews</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-2">
            <span className="text-[#ffc928]">
              <ShieldCheck className="w-9 h-9" aria-hidden="true" />
            </span>
            <div>
              <b className="block text-xl leading-tight font-mono tabular-nums">100%</b>
              <span className="text-[11px] text-[#c8d3ea]">Secure &amp; Guaranteed</span>
            </div>
          </div>
        </section>

        {/* Why Choose Playbeat? 6-Card Grid */}
        <section id="about" className="grid lg:grid-cols-[.9fr_2.2fr] gap-6 items-center mt-8">
          <div>
            <p className="text-[#ffc928] text-[11px] font-bold tracking-wide">
              WHY CHOOSE PLAYBEAT?
            </p>
            <h2 className="text-2xl font-extrabold leading-[1.1] mt-1">
              Built for a Smarter
              <br />
              Digital Life
            </h2>
            <p className="text-[11.5px] font-medium text-[#c8d3ea] my-3 leading-[1.5]">
              Shop Worldwide digital keys, book enterprise business services, and watch Playbeat LIVE TV all in one unified storefront.
            </p>
            <button
              type="button"
              onClick={() => onSelectView('business-services')}
              className="yb rounded-full px-5 h-[32px] inline-flex items-center text-[11px] font-bold"
            >
              Explore Business Services &nbsp;→
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Crown, title: 'Premium Quality', desc: '100% verified Worldwide keys' },
              { icon: Zap, title: 'Instant Delivery', desc: 'Keys issued immediately' },
              { icon: ShieldCheck, title: 'Multi-Rail Checkout', desc: 'Rapid PKR, PayPal & Manual' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated Playbeat desk' },
              { icon: UserCheck, title: 'Business Agency', desc: '32 enterprise service packages' },
              { icon: Diamond, title: 'Best Prices', desc: 'Competitive digital product pricing' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="edge rounded-xl p-4 flex items-center gap-3">
                  <span className="text-[#ffc928] shrink-0">
                    <Icon className="w-7 h-7" aria-hidden="true" />
                  </span>
                  <div>
                    <b className="block text-[13px]">{card.title}</b>
                    <span className="text-[11px] text-[#c8d3ea]">{card.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

    </>
  );
}
