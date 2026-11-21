import {
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Loader2,
  Send,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { BusinessService, ServiceCategory, ServicePackageLevel } from '../types/store';
import { resolveServiceImage } from '../lib/serviceImages';
import type { ActiveView } from './Navbar';
import { ResilientImage } from './ResilientImage';

interface BusinessServicesSectionProps {
  services: BusinessService[];
  globalSearch: string;
  onAddToCart: (sku: string) => void;
  onSelectView: (view: ActiveView) => void;
  onShowToast: (msg: string) => void;
}

const SERVICE_CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Business Websites',
  'E-Commerce',
  'CRM & Operations',
  'Lead Generation',
  'Real Estate',
  'Education',
  'FinTech / Dashboards',
  'Admin Systems',
  'Automation',
  'Custom Development',
];

const PACKAGE_LEVELS: Array<'All' | ServicePackageLevel> = [
  'All',
  'Basic',
  'Professional',
  'Enterprise',
];

export function BusinessServicesSection({
  services,
  globalSearch,
  onAddToCart,
  onSelectView,
  onShowToast,
}: BusinessServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ServiceCategory>('All');
  const [selectedLevel, setSelectedLevel] = useState<'All' | ServicePackageLevel>('All');
  const [showAllServices, setShowAllServices] = useState(true);
  const [inspectedService, setInspectedService] = useState<BusinessService | null>(null);
  const [inquiryService, setInquiryService] = useState<BusinessService | null>(null);

  // Proposal Inquiry Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredServices = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return services.filter((s) => {
      if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
      if (selectedLevel !== 'All' && s.packageLevel !== selectedLevel) return false;
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.category.toLowerCase().includes(q) &&
        !s.shortDescription.toLowerCase().includes(q) &&
        !s.deliverables.some((d) => d.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [services, selectedCategory, selectedLevel, globalSearch]);

  const displayedServices = useMemo(() => {
    if (showAllServices || selectedCategory !== 'All' || selectedLevel !== 'All' || globalSearch.trim()) {
      return filteredServices;
    }
    const featured = filteredServices.filter((s) => s.featured);
    return featured.length >= 6 ? featured.slice(0, 6) : filteredServices.slice(0, 6);
  }, [filteredServices, showAllServices, selectedCategory, selectedLevel, globalSearch]);

  // /product/<sku> deep links resolve services too (Google Shopping + shared links)
  useEffect(() => {
    const onInspectService = (e: Event) => {
      const sku = (e as CustomEvent<string>).detail;
      const svc = services.find((x) => x.sku === sku || x.id === sku);
      if (svc) {
        setInspectedService(svc);
        window.requestAnimationFrame(() => {
          document.getElementById('section2-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };
    window.addEventListener('pb-inspect-service', onInspectService);
    return () => window.removeEventListener('pb-inspect-service', onInspectService);
  }, [services]);

  const handleOpenInquiry = (svc: BusinessService) => {
    setInquiryService(svc);
    setInspectedService(null);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryService) return;
    if (!customerName.trim() || !customerEmail.includes('@')) {
      onShowToast('Please provide your name and a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/services/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: inquiryService.id,
          serviceName: inquiryService.name,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          companyName: companyName.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit proposal request.');

      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCompanyName('');
      setNotes('');
      setInquiryService(null);
      onShowToast(`Proposal request logged (${data.inquiry.id}). Our team will contact you shortly.`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Proposal request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <main className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-6 pb-4">
    <section id="section2-services" className="scroll-mt-20">
      {/* Header Row */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="text-[#ffc928] text-[12px] font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            PLAYBEAT.DIGITAL/SERVICES · ENTERPRISE AGENCY CATALOG
          </p>
          <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold leading-tight mt-1">
            Business &amp; <span className="text-[#1ea0ff]">Enterprise Solutions</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-[#c8d3ea] max-w-2xl">
            Done-for-you websites, e-commerce platforms, CRM operations, real estate portals, FinTech dashboards, and AI automation systems engineered by Playbeat Digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-[#2154d4] bg-[#040d29] p-0.5">
            {PACKAGE_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#1ea0ff] text-[#030a1f]'
                    : 'text-[#c8d3ea] hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAllServices((v) => !v)}
            className="text-[#1ea0ff] hover:text-[#ffd958] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer ml-1"
          >
            {showAllServices && selectedCategory === 'All' && selectedLevel === 'All'
              ? 'Show Top 6 Featured'
              : `View All ${services.length} Services →`}
          </button>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {SERVICE_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count =
            cat === 'All' ? services.length : services.filter((s) => s.category === cat).length;
          if (cat !== 'All' && count === 0) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                if (cat !== 'All') setShowAllServices(true);
              }}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'cat-active text-white border border-[#2f8bff]'
                  : 'border border-[#1d4ed888] bg-[#051239cc] text-[#c8d3ea] hover:border-[#2f8bff] hover:text-white'
              }`}
            >
              {cat}{' '}
              <span className="font-mono text-[10px] opacity-80 ml-0.5">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {displayedServices.length === 0 ? (
        <div className="edge rounded-2xl p-8 mt-5 text-center text-sm">
          <p className="text-[#c8d3ea]">No Playbeat business services match the current filter.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedLevel('All');
            }}
            className="mt-3 text-[#1ea0ff] font-bold underline cursor-pointer"
          >
            Reset service filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {displayedServices.map((svc) => (
            <article
              key={svc.id}
              className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#08142f] bg-gradient-to-br from-white/[0.055] via-transparent to-[#020819]/40 shadow-[0_14px_36px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4aa8ff]/60 hover:shadow-[0_22px_55px_rgba(0,0,0,0.38),0_0_28px_rgba(30,160,255,0.1)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="relative m-2 mb-0 overflow-hidden rounded-[17px] border border-white/[0.08] bg-[#040c22]">
                <button
                  type="button"
                  onClick={() => setInspectedService(svc)}
                  className="relative block aspect-[16/10] w-full cursor-pointer overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-[#ffc928]"
                  aria-label={`Preview ${svc.name}`}
                >
                  <ResilientImage
                    src={resolveServiceImage(svc)}
                    alt={`${svc.name} — customer interface preview`}
                    fallbackLabel={svc.category}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020819]/90 via-transparent to-[#020819]/25" />
                </button>

                <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2 text-[10px] font-bold">
                  <span className="max-w-[68%] truncate rounded-full border border-white/15 bg-[#020819]/80 px-2.5 py-1 uppercase tracking-wider text-[#b5ddff] shadow-lg backdrop-blur-md">
                    {svc.category}
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 font-mono shadow-lg backdrop-blur-md ${
                      svc.packageLevel === 'Enterprise'
                        ? 'border-[#ffd958]/50 bg-[#2c240c]/85 text-[#ffe074]'
                        : svc.packageLevel === 'Professional'
                          ? 'border-[#69baff]/50 bg-[#08254a]/85 text-[#d6efff]'
                          : 'border-white/15 bg-[#020819]/80 text-[#d4def0]'
                    }`}
                  >
                    {svc.packageLevel}
                  </span>
                </div>

                <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#020819]/80 px-2.5 py-1 text-[9.5px] font-bold text-white backdrop-blur-md">
                  <Eye className="h-3.5 w-3.5 text-[#79c4ff]" aria-hidden="true" />
                  Customer experience preview
                </span>
              </div>

              <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                <button
                  type="button"
                  onClick={() => setInspectedService(svc)}
                  className="cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#ffd958]"
                >
                  <h3 className="line-clamp-2 min-h-[48px] text-[16px] font-extrabold leading-[1.5] text-white transition-colors group-hover:text-[#8bcaff]">
                    {svc.name}
                  </h3>
                </button>
                <p className="mt-2 line-clamp-3 min-h-[60px] text-[12px] leading-[1.65] text-[#a9bad6]">
                  {svc.shortDescription}
                </p>

                {svc.quantifiedOutcome && (
                  <p className="mt-3 flex items-start gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-3 py-2 text-[10.5px] font-semibold leading-relaxed text-emerald-200">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffd958]" aria-hidden="true" />
                    <span>{svc.quantifiedOutcome}</span>
                  </p>
                )}

                <div className="mt-4 rounded-2xl border border-white/[0.07] bg-[#030c22]/55 p-3.5">
                  <p className="mb-2.5 flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#ffd958]">
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    What you&apos;ll receive
                  </p>
                  <ul className="space-y-2">
                    {svc.deliverables.slice(0, 3).map((deliverable) => (
                      <li key={deliverable} className="flex items-start gap-2 text-[11px] leading-relaxed text-[#d6e1f7]">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
                        <span className="line-clamp-1">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                  {svc.deliverables.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setInspectedService(svc)}
                      className="mt-2.5 cursor-pointer text-[10.5px] font-bold text-[#79c4ff] hover:text-[#ffd958]"
                    >
                      +{svc.deliverables.length - 3} more · View full scope
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-5">
                  <div className="flex items-end justify-between gap-3 border-t border-white/[0.08] pt-4">
                    <div className="font-mono tabular-nums">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7f92b4]">
                        {svc.isStartingFrom ? 'Starting from' : 'Package investment'}
                      </span>
                      <span className="mt-1 block text-[19px] font-extrabold text-[#ffe074]">
                        ₨{svc.recommendedPkr.toLocaleString()}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#93a7c9]">
                        ≈ ${svc.optionalUsd.toLocaleString()} USD
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#69baff]/15 bg-[#0b214c]/60 px-2.5 py-1.5 text-[10px] font-semibold text-[#b9cbea]">
                      <Clock className="h-3.5 w-3.5 text-[#79c4ff]" aria-hidden="true" />
                      <span>{svc.deliveryTime}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => onAddToCart(svc.sku)}
                      className="yb inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-[11px] font-extrabold"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                      Book package
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenInquiry(svc)}
                      className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#2f8bff]/40 bg-[#0b214c]/70 text-[11px] font-extrabold text-[#b9dcff] transition-all hover:border-[#69baff] hover:bg-[#12366f] hover:text-white"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      Get proposal
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Service Scope Inspection Modal */}
      {inspectedService && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={inspectedService.name}
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setInspectedService(null)}
          />
          <div className="edge-solid relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[26px]">
            <button
              type="button"
              onClick={() => setInspectedService(null)}
              aria-label="Close scope"
              className="absolute right-4 top-4 z-20 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-[#020819]/80 text-white backdrop-blur-md transition-colors hover:text-[#ffd958]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative h-60 overflow-hidden rounded-t-[26px] bg-[#040c22] sm:h-80">
              <ResilientImage
                src={resolveServiceImage(inspectedService)}
                alt={`${inspectedService.name} — full customer interface preview`}
                fallbackLabel={inspectedService.category}
                loading="eager"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020819]/85 via-transparent to-[#020819]/20" />
              <span className="absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#020819]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                <Eye className="h-4 w-4 text-[#79c4ff]" aria-hidden="true" />
                Customer experience preview
              </span>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-bold">
                <span className="rounded-full border border-[#69baff]/25 bg-[#1ea0ff]/10 px-2.5 py-1 uppercase tracking-wider text-[#9ed5ff]">
                  {inspectedService.category}
                </span>
                <span className="rounded-full border border-[#ffd958]/35 bg-[#ffd958]/10 px-2.5 py-1 font-mono text-[#ffe074]">
                  {inspectedService.packageLevel}
                </span>
                <span className="inline-flex items-center gap-1.5 px-1 text-[#9fb1d2]">
                  <Clock className="h-3.5 w-3.5 text-[#79c4ff]" aria-hidden="true" />
                  {inspectedService.deliveryTime}
                </span>
              </div>

              <h3 className="mt-3 pr-8 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                {inspectedService.name}
              </h3>
              <p className="mt-3 max-w-3xl text-[13px] leading-[1.75] text-[#afc0dc] sm:text-sm">
                {inspectedService.shortDescription}
              </p>

              {inspectedService.quantifiedOutcome && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.08] px-4 py-3 text-xs font-semibold text-emerald-200">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#ffd958]" aria-hidden="true" />
                  {inspectedService.quantifiedOutcome}
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#030c22]/60 p-4 sm:p-5">
                <p className="mb-4 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ffd958]">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  Everything included in your package ({inspectedService.deliverables.length})
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {inspectedService.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-xs leading-relaxed text-[#e6eeff]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                      <span>{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                <div className="font-mono tabular-nums">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#7f92b4]">
                    {inspectedService.isStartingFrom ? 'Starting from' : 'Package investment'}
                  </span>
                  <span className="mt-1 block text-2xl font-extrabold text-[#ffe074]">
                    ₨{inspectedService.recommendedPkr.toLocaleString()}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#93a7c9]">
                    ≈ ${inspectedService.optionalUsd.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenInquiry(inspectedService)}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#2f8bff]/40 bg-[#0b214c]/70 px-4 text-xs font-extrabold text-[#b9dcff] transition-colors hover:border-[#69baff] hover:bg-[#12366f] hover:text-white"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    Request proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(inspectedService.sku);
                      setInspectedService(null);
                    }}
                    className="yb inline-flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-extrabold"
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Book package
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Proposal Inquiry Modal */}
      {inquiryService && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Request Business Service Proposal"
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setInquiryService(null)}
          />
          <form
            onSubmit={handleSubmitInquiry}
            className="edge-solid relative z-10 w-full max-w-md rounded-2xl p-6 space-y-3.5"
          >
            <button
              type="button"
              onClick={() => setInquiryService(null)}
              aria-label="Close proposal modal"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full border border-[#2154d4] grid place-items-center text-[#f2f6ff] hover:text-[#ffd958] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <p className="text-[11px] font-bold text-[#ffc928] uppercase tracking-wider">
                Playbeat Digital Business Desk
              </p>
              <h3 className="text-lg font-extrabold text-[#f2f6ff] mt-0.5 pr-8">
                Request Proposal: {inquiryService.name}
              </h3>
              <p className="text-xs text-[#c8d3ea] mt-1 font-mono">
                Estimated Budget: ₨{inquiryService.recommendedPkr.toLocaleString()} PKR ·{' '}
                {inquiryService.deliveryTime}
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#c8d3ea] mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ayesha Khan"
                  className="pb-input px-3 py-2 text-xs"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#c8d3ea] mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="pb-input px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#c8d3ea] mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="pb-input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#c8d3ea] mb-1">
                  Company / Brand Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company or Agency"
                  className="pb-input px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#c8d3ea] mb-1">
                  Project Requirements &amp; Timeline
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share target launch date, integrations, or custom workflows..."
                  className="pb-input px-3 py-2 text-xs resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="yb rounded-full h-10 w-full text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit Proposal Inquiry
            </button>
          </form>
        </div>
      )}
    </section>
    </main>

    </>
  );
}
