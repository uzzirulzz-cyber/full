import { BadgeCheck, CheckCircle2, Globe, ShieldCheck, ShoppingCart, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Product } from '../types/store';
import { categoryCardImage, resolveProductImage } from '../lib/productImages';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (sku: string) => void;
}

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="edge-solid relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-[#030a1fcc] border border-[#2154d4] grid place-items-center text-[#f2f6ff] hover:text-[#ffd958] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-[1fr_1.25fr] gap-0">
          <div className="bg-[#040d29] p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1d4ed855]">
            <div className="rounded-xl overflow-hidden border border-[#2154d4]">
              <img
                src={resolveProductImage(product)}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = categoryCardImage(product.category);
                }}
                referrerPolicy="no-referrer"
                className="w-full h-48 md:h-52 object-cover"
              />
            </div>

            <div className="mt-4 space-y-2 text-[11.5px]">
              <div className="flex items-center justify-between py-1.5 border-b border-[#1d4ed844]">
                <span className="text-[#c8d3ea]">Playbeat ID</span>
                <span className="font-mono font-semibold text-[#f2f6ff]">
                  {product.publicCode || 'PB-VERIFIED'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1d4ed844]">
                <span className="text-[#c8d3ea]">Region</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#1ea0ff]">
                  <Globe className="w-3.5 h-3.5" />
                  {product.region}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1d4ed844]">
                <span className="text-[#c8d3ea]">Platform</span>
                <span className="font-semibold text-[#f2f6ff]">{product.platform}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#c8d3ea]">Availability</span>
                <span className="font-mono font-bold text-[#ffd958]">
                  {product.stockStatus} ({product.stockCount})
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="text-[#1ea0ff] uppercase tracking-wider">{product.category}</span>
              {product.discountPercent > 0 && (
                <span className="rounded bg-[#ffd958]/15 border border-[#ffd958]/40 px-2 py-0.5 text-[#ffd958] font-mono">
                  SAVE {product.discountPercent}%
                </span>
              )}
              {product.affiliatePartner !== false && (
                <span className="inline-flex items-center gap-1 rounded bg-[#1ea0ff]/15 border border-[#1ea0ff]/40 px-2 py-0.5 text-[#c8e8ff] text-[10px]">
                  <BadgeCheck className="w-3 h-3 text-[#ffd958]" />
                  Verified Affiliate Partner
                </span>
              )}
            </div>

            <h3 className="text-xl font-extrabold text-[#f2f6ff] mt-1.5 leading-snug">
              {product.name}
            </h3>

            <p className="text-[13px] text-[#c8d3ea] mt-3 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-4 rounded-xl bg-[#040d29aa] border border-[#1d4ed866] p-3.5">
              <p className="text-[11px] font-bold text-[#ffc928] uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Activation Instructions
              </p>
              <p className="text-[12px] text-[#c8d3ea] mt-1.5 leading-relaxed">
                {product.activationGuide}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11.5px] text-[#c8d3ea]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#ffd958]" />
                {product.deliveryType}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[#9eb2db] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1ea0ff]" />
                Playbeat Digital Guarantee
              </span>
            </div>

            <div className="mt-auto pt-5 border-t border-[#1d4ed855] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-2xl font-extrabold text-[#ffd958]">
                    ${product.priceUsd.toFixed(2)}
                  </span>
                  {product.originalPriceUsd > product.priceUsd && (
                    <span className="text-xs text-[#9eb2db] line-through">
                      ${product.originalPriceUsd.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#c8d3ea] font-mono tabular-nums">
                  ≈ ₨{product.pricePkr.toLocaleString()} PKR (Rapid Gateway)
                </p>
              </div>

              <button
                type="button"
                disabled={product.stockStatus === 'Out of Stock'}
                onClick={() => {
                  onAddToCart(product.sku);
                  onClose();
                }}
                className="yb rounded-full px-6 h-10 inline-flex items-center gap-2 text-[13px] font-bold shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
