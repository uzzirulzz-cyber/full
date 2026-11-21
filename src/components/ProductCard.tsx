import {
  ArrowUpRight,
  BadgeCheck,
  Eye,
  Globe,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import type { Product, ProductCategory } from '../types/store';
import { categoryCardImage, resolveProductImage } from '../lib/productImages';

const CATEGORY_PILLS: Record<ProductCategory, string> = {
  'PC Games': 'border-violet-300/20 bg-violet-400/10 text-violet-200',
  'Console Subscriptions': 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200',
  'Gift Cards': 'border-amber-300/20 bg-amber-400/10 text-amber-200',
  'Software Keys': 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
  'Security & VPN': 'border-rose-300/20 bg-rose-400/10 text-rose-200',
};

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  onAddToCart: (sku: string) => void;
  onInspectProduct: (product: Product) => void;
}

export function ProductCard({
  product,
  priority = false,
  onAddToCart,
  onInspectProduct,
}: ProductCardProps) {
  const isOutOfStock = product.stockStatus === 'Out of Stock';
  const isVerified = product.supplierVerified || product.affiliatePartner;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#08142f] bg-gradient-to-br from-white/[0.055] via-transparent to-[#020819]/40 shadow-[0_14px_36px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4aa8ff]/60 hover:shadow-[0_22px_55px_rgba(0,0,0,0.38),0_0_28px_rgba(30,160,255,0.1)] motion-reduce:transform-none motion-reduce:transition-none">
      <div className="relative m-2 mb-0 overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#040c22]">
        <button
          type="button"
          onClick={() => onInspectProduct(product)}
          className="block aspect-[16/11] w-full cursor-pointer overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd958]"
          aria-label={`View details for ${product.name}`}
        >
          <img
            src={resolveProductImage(product)}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = categoryCardImage(product.category);
            }}
            referrerPolicy="no-referrer"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.055] motion-reduce:transition-none motion-reduce:group-hover:transform-none"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020819]/85 via-transparent to-[#020819]/15" />
        </button>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="max-w-[65%] truncate rounded-full border border-white/15 bg-[#020819]/80 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
            {product.platform}
          </span>
          {product.discountPercent > 0 && (
            <span className="shrink-0 rounded-full border border-[#ffe38a]/40 bg-[#ffc928] px-2.5 py-1 font-mono text-[10px] font-black text-[#171207] shadow-[0_5px_20px_rgba(255,201,40,0.22)]">
              −{product.discountPercent}%
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onInspectProduct(product)}
          aria-label={`Quick view ${product.name}`}
          title="Quick view"
          className="absolute bottom-3 right-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-[#061236]/85 text-white opacity-100 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-[#1b64c8] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[#ffd958] sm:translate-y-1 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-[#031b24]/85 px-2.5 py-1 text-[9.5px] font-bold text-emerald-200 backdrop-blur-md">
          <Zap className="h-3 w-3 fill-current" aria-hidden="true" />
          Instant delivery
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="flex min-h-6 items-center justify-between gap-2">
          <span className={`inline-flex max-w-[72%] truncate rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.09em] ${CATEGORY_PILLS[product.category]}`}>
            {product.category}
          </span>
          {isVerified && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[9.5px] font-bold text-[#8fcaff]" title="Verified partner product">
              <BadgeCheck className="h-3.5 w-3.5 text-[#ffd958]" aria-hidden="true" />
              Verified
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onInspectProduct(product)}
          className="mt-2.5 line-clamp-2 min-h-[44px] cursor-pointer text-left text-[14px] font-bold leading-[1.55] text-[#f5f8ff] transition-colors hover:text-[#79c4ff] focus-visible:outline-2 focus-visible:outline-[#ffd958]"
        >
          {product.name}
        </button>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[10.5px] font-medium">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[#9fb1d2]">
            <Globe className="h-3.5 w-3.5 shrink-0 text-[#68b7ff]" aria-hidden="true" />
            <span className="truncate">{product.region}</span>
          </span>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 font-semibold ${
              isOutOfStock
                ? 'text-rose-300'
                : product.stockStatus === 'Low Stock'
                  ? 'text-[#ffd958]'
                  : 'text-emerald-300'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${isOutOfStock ? '' : 'shadow-[0_0_8px_currentColor]'}`} />
            {product.stockStatus === 'Low Stock' && product.stockCount > 0
              ? `Only ${product.stockCount} left`
              : product.stockStatus}
          </span>
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#778cab]">Your price</p>
            <div className="flex flex-wrap items-baseline gap-x-2 font-mono tabular-nums">
              <span className="text-[22px] font-extrabold tracking-tight text-[#ffe074]">
                ${product.priceUsd.toFixed(2)}
              </span>
              {product.originalPriceUsd > product.priceUsd && (
                <span className="text-[11px] text-[#7f92b4] line-through">
                  ${product.originalPriceUsd.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <ShieldCheck className="mb-1 h-5 w-5 text-[#407cc2]" aria-label="Playbeat purchase protection" />
        </div>
        <p className="mt-1 font-mono text-[10.5px] tabular-nums text-[#9fb1d2]">
          ≈ ₨{product.pricePkr.toLocaleString()} <span className="font-sans text-[9px] uppercase tracking-wider">PKR</span>
        </p>

        <div className="mt-auto flex gap-2 pt-4">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.sku)}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            className="yb inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-[11.5px] font-extrabold"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
          <button
            type="button"
            onClick={() => onInspectProduct(product)}
            aria-label={`View full details for ${product.name}`}
            title="View details"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-[#2f8bff]/40 bg-[#0b214c]/70 text-[#9bd2ff] transition-all hover:border-[#65b9ff] hover:bg-[#12366f] hover:text-white focus-visible:outline-2 focus-visible:outline-[#ffd958]"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
