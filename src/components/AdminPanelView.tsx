import {
  Activity,
  Eye,
  EyeOff,
  Globe,
  Inbox,
  Layers,
  PhoneCall,
  Plus,
  ShoppingBag,
  Trash2,
  Tv,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  BusinessService,
  ElectronicFirstSyncResult,
  IntegrationReadiness,
  LiveTvChannel,
  LiveTvPlan,
  OrderRecord,
  Product,
  ProductCategory,
  ProductPlatform,
  ServiceCategory,
  ServiceInquiry,
  ServicePackageLevel,
  TvChannelCategory,
} from '../types/store';
import { adminFetch, adminLogout } from '../lib/adminAuth';
import { CatalogTableView } from './CatalogTableView';
import { CrmPlatformView } from './CrmPlatformView';
import { IntegrationsView, type WebhookLogEntry } from './IntegrationsView';
import { IzokoCrmView } from './IzokoCrmView';
import { OrdersView } from './OrdersView';
import { PlaybeatLivePanel } from './PlaybeatLivePanel';
import { CelestialDashboard } from './celestial-admin/CelestialDashboard';
import { CelestialNavbar } from './celestial-admin/CelestialNavbar';
import { CelestialSidebar } from './celestial-admin/CelestialSidebar';
import { CelestialPageHeader } from './celestial-admin/CelestialPageHeader';
import { adminTabFromLocation, routeForAdminTab } from './celestial-admin/routes';
import '../celestial-admin/celestial.css';
import '../celestial-admin/integration.css';

export type AdminTab = 'overview' | 'live' | 'extraction' | 'sections' | 'orders' | 'crm' | 'crm-platform' | 'diagnostics';
type SectionManagerTab = 'section1' | 'section2' | 'section3-channels' | 'section3-plans';

interface AdminPanelViewProps {
  initialTab?: AdminTab;
  digitalProducts: Product[];
  businessServices: BusinessService[];
  liveTvChannels: LiveTvChannel[];
  liveTvPlans: LiveTvPlan[];
  serviceInquiries: ServiceInquiry[];
  orders: OrderRecord[];
  readiness: IntegrationReadiness | null;
  syncStatus: ElectronicFirstSyncResult | null;
  webhookLogs: WebhookLogEntry[];
  isSyncing: boolean;
  onSyncElectronicFirst: () => Promise<void>;
  onRefreshAll: () => Promise<void>;
  onOrderUpdated: (order: OrderRecord) => void;
  onInquiryUpdated: (inquiry: ServiceInquiry) => void;
  onBackToStorefront: () => void;
  onShowToast: (msg: string) => void;
}

export function AdminPanelView({
  initialTab = 'overview',
  digitalProducts,
  businessServices,
  liveTvChannels,
  liveTvPlans,
  serviceInquiries,
  orders,
  readiness,
  syncStatus,
  webhookLogs,
  isSyncing,
  onSyncElectronicFirst,
  onRefreshAll,
  onOrderUpdated,
  onInquiryUpdated,
  onBackToStorefront,
  onShowToast,
}: AdminPanelViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => adminTabFromLocation(initialTab));
  const [sectionSubTab, setSectionSubTab] = useState<SectionManagerTab>('section1');
  const [saving, setSaving] = useState(false);
  const [visibleAdminProducts, setVisibleAdminProducts] = useState(100);
  const [adminSearch, setAdminSearch] = useState('');

  const navigateAdmin = (tab: AdminTab) => {
    setActiveTab(tab);
    const route = routeForAdminTab(tab);
    if (window.location.hash !== `#${route.path}`) {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}#${route.path}`);
    }
  };

  useEffect(() => {
    const onRouteChange = () => setActiveTab(adminTabFromLocation(initialTab));
    window.addEventListener('hashchange', onRouteChange);
    return () => window.removeEventListener('hashchange', onRouteChange);
  }, [initialTab]);

  const handleLockAdmin = async () => {
    await adminLogout();
    onShowToast('Admin panel locked. Password required on next visit.');
  };

  // Izoko CRM — move a lead through the pipeline (NEW → CONTACTED → QUOTED → WON/LOST)
  const handleInquiryStatusChange = async (id: string, status: ServiceInquiry['status']) => {
    try {
      const res = await adminFetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Status update failed.');
      onInquiryUpdated((data.inquiry as ServiceInquiry) || { ...serviceInquiries.find((i) => i.id === id)!, status });
      onShowToast(`Lead marked as ${status.charAt(0) + status.slice(1).toLowerCase()}.`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Status update failed.');
    }
  };

  // Add Section 1 Digital Product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<ProductCategory>('PC Games');
  const [newProdPlat, setNewProdPlat] = useState<ProductPlatform>('Steam');
  const [newProdPrice, setNewProdPrice] = useState('19.99');
  const [newProdMsrp, setNewProdMsrp] = useState('49.99');
  const [newProdStock, setNewProdStock] = useState('100');

  // Add Section 2 Business Service form
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcCat, setNewSvcCat] = useState<ServiceCategory>('Business Websites');
  const [newSvcLevel, setNewSvcLevel] = useState<ServicePackageLevel>('Professional');
  const [newSvcPkr, setNewSvcPkr] = useState('149000');
  const [newSvcDelivery, setNewSvcDelivery] = useState('2–3 Weeks');
  const [newSvcDesc, setNewSvcDesc] = useState('');
  const [newSvcDeliverables, setNewSvcDeliverables] = useState('');

  // Add Section 3 LIVE TV Channel form
  const [newChName, setNewChName] = useState('');
  const [newChCat, setNewChCat] = useState<TvChannelCategory>('News');
  const [newChCountry, setNewChCountry] = useState('International');
  const [newChQuality, setNewChQuality] = useState<'4K UHD' | '1080p HD' | '720p HD'>('1080p HD');
  const [newChUrl, setNewChUrl] = useState('');
  const [newChTagline, setNewChTagline] = useState('');

  // Add Section 3 LIVE TV Plan form
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanType, setNewPlanType] = useState<LiveTvPlan['lineType']>('Xtream Line');
  const [newPlanDuration, setNewPlanDuration] = useState('6 Months');
  const [newPlanUsd, setNewPlanUsd] = useState('29.99');
  const [newPlanConns, setNewPlanConns] = useState('2');
  const [newPlanFeatures, setNewPlanFeatures] = useState('18,000+ Live Channels\n4K UHD Sports & Movies\nInstant Activation');

  const toggleProductPublish = async (p: Product) => {
    try {
      const res = await adminFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, published: p.published === false }),
      });
      if (!res.ok) throw new Error('Failed to update product visibility');
      await onRefreshAll();
      onShowToast(`${p.name} ${p.published === false ? 'published to' : 'hidden from'} Section 1.`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const deleteProduct = async (sku: string, name: string) => {
    try {
      await adminFetch(`/api/admin/products/${encodeURIComponent(sku)}`, { method: 'DELETE' });
      await onRefreshAll();
      onShowToast(`Removed ${name} from Section 1.`);
    } catch {
      onShowToast('Failed to delete product.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName.trim(),
          category: newProdCat,
          platform: newProdPlat,
          priceUsd: Number(newProdPrice),
          originalPriceUsd: Number(newProdMsrp),
          stockCount: Number(newProdStock),
          published: true,
          affiliatePartner: true,
        }),
      });
      if (!res.ok) throw new Error('Could not add digital product');
      setNewProdName('');
      await onRefreshAll();
      onShowToast('New Section 1 Digital Product added and synced to buyer storefront.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Add failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleServicePublish = async (s: BusinessService) => {
    try {
      await adminFetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, published: !s.published }),
      });
      await onRefreshAll();
      onShowToast(`${s.name} ${!s.published ? 'published to' : 'hidden from'} Section 2.`);
    } catch {
      onShowToast('Failed to update service.');
    }
  };

  const deleteService = async (id: string, name: string) => {
    try {
      await adminFetch(`/api/admin/services/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await onRefreshAll();
      onShowToast(`Removed ${name} from Section 2.`);
    } catch {
      onShowToast('Failed to delete service.');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName.trim()) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSvcName.trim(),
          category: newSvcCat,
          packageLevel: newSvcLevel,
          recommendedPkr: Number(newSvcPkr),
          deliveryTime: newSvcDelivery.trim(),
          shortDescription: newSvcDesc.trim() || 'Enterprise service package by Playbeat Digital.',
          deliverables: newSvcDeliverables
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean),
          published: true,
        }),
      });
      if (!res.ok) throw new Error('Could not save service');
      setNewSvcName('');
      setNewSvcDesc('');
      setNewSvcDeliverables('');
      await onRefreshAll();
      onShowToast('New Section 2 Business Service published to playbeat.digital/services.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleChannelPublish = async (ch: LiveTvChannel) => {
    try {
      await adminFetch('/api/admin/livetv/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ch, published: !ch.published }),
      });
      await onRefreshAll();
      onShowToast(`${ch.name} ${!ch.published ? 'published to' : 'hidden from'} LIVE TV.`);
    } catch {
      onShowToast('Failed to update channel.');
    }
  };

  const deleteChannel = async (id: string, name: string) => {
    try {
      await adminFetch(`/api/admin/livetv/channels/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await onRefreshAll();
      onShowToast(`Removed ${name} from Section 3 LIVE TV.`);
    } catch {
      onShowToast('Failed to delete channel.');
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChName.trim()) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/livetv/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChName.trim(),
          category: newChCat,
          country: newChCountry.trim(),
          quality: newChQuality,
          streamUrl: newChUrl.trim(),
          tagline: newChTagline.trim() || '24/7 live broadcast stream on Playbeat LIVE TV.',
          published: true,
        }),
      });
      if (!res.ok) throw new Error('Could not add channel');
      setNewChName('');
      setNewChTagline('');
      await onRefreshAll();
      onShowToast('New LIVE TV channel published to Section 3.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Add failed');
    } finally {
      setSaving(false);
    }
  };

  const togglePlanPublish = async (pl: LiveTvPlan) => {
    try {
      await adminFetch('/api/admin/livetv/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pl, published: !pl.published }),
      });
      await onRefreshAll();
      onShowToast(`${pl.name} ${!pl.published ? 'published to' : 'hidden from'} Section 3.`);
    } catch {
      onShowToast('Failed to update TV plan.');
    }
  };

  const deletePlan = async (id: string, name: string) => {
    try {
      await adminFetch(`/api/admin/livetv/plans/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await onRefreshAll();
      onShowToast(`Removed ${name} from LIVE TV plans.`);
    } catch {
      onShowToast('Failed to delete plan.');
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/livetv/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanName.trim(),
          lineType: newPlanType,
          durationLabel: newPlanDuration.trim(),
          priceUsd: Number(newPlanUsd),
          connections: Number(newPlanConns),
          features: newPlanFeatures.split('\n').map((s) => s.trim()).filter(Boolean),
          published: true,
        }),
      });
      if (!res.ok) throw new Error('Could not save TV plan');
      setNewPlanName('');
      await onRefreshAll();
      onShowToast('New Playbeat LIVE TV pass published to Section 3.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleInquiryStatus = async (id: string, status: ServiceInquiry['status']) => {
    try {
      await adminFetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await onRefreshAll();
      onShowToast(`Inquiry ${id} marked ${status}.`);
    } catch {
      onShowToast('Failed to update inquiry status.');
    }
  };

  return (
    <div className="celestial-admin container-scroller">
      <CelestialSidebar
        activeTab={activeTab}
        search={adminSearch}
        onSearchChange={setAdminSearch}
        onNavigate={navigateAdmin}
        onBackToStorefront={onBackToStorefront}
        onLock={() => void handleLockAdmin()}
      />
      <div className="container-fluid page-body-wrapper">
        <CelestialNavbar
          isSyncing={isSyncing}
          inquiries={serviceInquiries}
          orders={orders}
          onNavigate={navigateAdmin}
          onSync={() => void onSyncElectronicFirst()}
          onBackToStorefront={onBackToStorefront}
          onLock={() => void handleLockAdmin()}
        />
        <div className="main-panel">
          <main className="content-wrapper">
            {activeTab !== 'overview' && <CelestialPageHeader activeTab={activeTab} />}

      {activeTab === 'overview' && (
        <div className="celestial-dashboard">
          <CelestialDashboard
            digitalProducts={digitalProducts}
            businessServices={businessServices}
            liveTvChannels={liveTvChannels}
            liveTvPlans={liveTvPlans}
            orders={orders}
            serviceInquiries={serviceInquiries}
            readiness={readiness}
            syncStatus={syncStatus}
            onNavigate={navigateAdmin}
          />
          <div className="row"><div className="col-12">
            <PlaybeatLivePanel
              compact
              onNavigate={(destination) => {
                if (destination === 'iptv') navigateAdmin('live');
                if (destination === 'business') navigateAdmin('diagnostics');
              }}
            />
          </div></div>
        </div>
      )}

      {/* ══════════════ TAB 2: ADMIN-ONLY WORLDWIDE EXTRACTION & SYNC ══════════════ */}
      {activeTab === 'extraction' && (
        <CatalogTableView
          products={digitalProducts}
          externalSearch={adminSearch}
          syncStatus={syncStatus}
          isSyncing={isSyncing}
          onSyncApi={() => void onSyncElectronicFirst()}
          onTogglePublish={(p) => void toggleProductPublish(p)}
          onShowToast={onShowToast}
        />
      )}

      {/* ══════════════ TAB 3: ALL 3 SECTIONS & PRODUCTS MANAGER ══════════════ */}
      {activeTab === 'sections' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'section1' as const, label: `Section 1 · Digital Products (${digitalProducts.length})` },
              { id: 'section2' as const, label: `Section 2 · Business Services (${businessServices.length})` },
              { id: 'section3-channels' as const, label: `Section 3 · LIVE TV Channels (${liveTvChannels.length})` },
              { id: 'section3-plans' as const, label: `Section 3 · LIVE TV Passes (${liveTvPlans.length})` },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSectionSubTab(sub.id)}
                className={`rounded-full px-4 h-8 text-xs font-bold cursor-pointer transition-colors ${
                  sectionSubTab === sub.id
                    ? 'bg-[#ffd958] text-[#030a1f]'
                    : 'ob bg-[#061236] text-[#c8d3ea] hover:text-white'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* SECTION 1 MANAGER */}
          {sectionSubTab === 'section1' && (
            <div className="space-y-4">
              <form onSubmit={handleAddProduct} className="card forms-sample space-y-3">
                <h3 className="text-sm font-extrabold text-[#ffd958] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add New Section 1 Digital Product (Affiliate / Playbeat Store)
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Product Name *"
                    className="pb-input px-3 py-2 text-xs lg:col-span-2"
                  />
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value as ProductCategory)}
                    className="pb-input px-2.5 py-2 text-xs"
                  >
                    {(['PC Games', 'Console Subscriptions', 'Gift Cards', 'Software Keys', 'Security & VPN'] as const).map((c) => (
                      <option key={c} value={c} className="bg-[#051239]">{c}</option>
                    ))}
                  </select>
                  <select
                    value={newProdPlat}
                    onChange={(e) => setNewProdPlat(e.target.value as ProductPlatform)}
                    className="pb-input px-2.5 py-2 text-xs"
                  >
                    {(['Steam', 'Xbox', 'PlayStation', 'PC', 'Nintendo', 'Windows / Office', 'Multi-Device'] as const).map((pl) => (
                      <option key={pl} value={pl} className="bg-[#051239]">{pl}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="Price USD"
                    className="pb-input px-3 py-2 text-xs font-mono"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={newProdMsrp}
                      onChange={(e) => setNewProdMsrp(e.target.value)}
                      placeholder="MSRP USD"
                      className="pb-input px-2.5 py-2 text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      placeholder="Stock"
                      className="pb-input px-2.5 py-2 text-xs font-mono w-20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="yb rounded-full px-5 h-8 text-xs font-bold"
                >
                  Save &amp; Publish to Section 1
                </button>
              </form>

              <div className="edge rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-hover w-full text-left text-xs">
                    <thead className="bg-[#040d29] border-b border-[#2154d4] text-[10.5px] uppercase text-[#c8d3ea]">
                      <tr>
                        <th className="py-3 px-4">Product &amp; Public Code</th>
                        <th className="py-3 px-3">Category / Platform</th>
                        <th className="py-3 px-3 text-right">USD / PKR</th>
                        <th className="py-3 px-3 text-right">Stock</th>
                        <th className="py-3 px-4 text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1d4ed844]">
                      {digitalProducts.slice(0, visibleAdminProducts).map((p) => (
                        <tr key={p.sku} className="hover:bg-[#0b2a8a33]">
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-[#f2f6ff]">{p.name}</p>
                            <p className="text-[10.5px] font-mono text-[#9eb2db]">
                              {p.publicCode || 'PB-AUTO'} · Supplier SKU: {p.sku}
                            </p>
                          </td>
                          <td className="py-2.5 px-3 text-[#c8d3ea]">
                            {p.category} · <span className="text-[#1ea0ff]">{p.platform}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <span className="font-bold text-[#ffd958]">${p.priceUsd.toFixed(2)}</span>
                            <span className="block text-[10px] text-[#c8d3ea]">₨{p.pricePkr.toLocaleString()}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#f2f6ff]">{p.stockCount}</td>
                          <td className="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => void toggleProductPublish(p)}
                              className="ob rounded-full px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                            >
                              {p.published !== false ? 'Published' : 'Hidden'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteProduct(p.sku, p.name)}
                              aria-label={`Delete ${p.name}`}
                              className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer align-middle"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
                <span>Showing {Math.min(visibleAdminProducts, digitalProducts.length).toLocaleString()} of {digitalProducts.length.toLocaleString()} products</span>
                {visibleAdminProducts < digitalProducts.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleAdminProducts((count) => count + 100)}
                    className="pa-btn px-4 py-2 font-bold"
                  >
                    Load 100 more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2 MANAGER */}
          {sectionSubTab === 'section2' && (
            <div className="space-y-4">
              <form onSubmit={handleAddService} className="card forms-sample space-y-3">
                <h3 className="text-sm font-extrabold text-[#ffd958] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add New Section 2 Business Service (playbeat.digital/services)
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newSvcName}
                    onChange={(e) => setNewSvcName(e.target.value)}
                    placeholder="Service Title *"
                    className="pb-input px-3 py-2 text-xs lg:col-span-2"
                  />
                  <select
                    value={newSvcCat}
                    onChange={(e) => setNewSvcCat(e.target.value as ServiceCategory)}
                    className="pb-input px-2.5 py-2 text-xs"
                  >
                    {([
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
                    ] as const).map((c) => (
                      <option key={c} value={c} className="bg-[#051239]">{c}</option>
                    ))}
                  </select>
                  <select
                    value={newSvcLevel}
                    onChange={(e) => setNewSvcLevel(e.target.value as ServicePackageLevel)}
                    className="pb-input px-2.5 py-2 text-xs"
                  >
                    {(['Basic', 'Professional', 'Enterprise'] as const).map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-[#051239]">{lvl}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newSvcPkr}
                      onChange={(e) => setNewSvcPkr(e.target.value)}
                      placeholder="PKR Price"
                      className="pb-input px-2.5 py-2 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={newSvcDelivery}
                      onChange={(e) => setNewSvcDelivery(e.target.value)}
                      placeholder="Timeline"
                      className="pb-input px-2.5 py-2 text-xs"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newSvcDesc}
                    onChange={(e) => setNewSvcDesc(e.target.value)}
                    placeholder="Short description..."
                    className="pb-input px-3 py-2 text-xs"
                  />
                  <textarea
                    rows={2}
                    value={newSvcDeliverables}
                    onChange={(e) => setNewSvcDeliverables(e.target.value)}
                    placeholder="Deliverables (one per line)..."
                    className="pb-input px-3 py-2 text-xs resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="yb rounded-full px-5 h-8 text-xs font-bold"
                >
                  Save &amp; Publish Service
                </button>
              </form>

              <div className="edge rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-hover w-full text-left text-xs">
                    <thead className="bg-[#040d29] border-b border-[#2154d4] text-[10.5px] uppercase text-[#c8d3ea]">
                      <tr>
                        <th className="py-3 px-4">Service Name &amp; SKU</th>
                        <th className="py-3 px-3">Category &amp; Tier</th>
                        <th className="py-3 px-3">Delivery</th>
                        <th className="py-3 px-3 text-right">PKR / USD</th>
                        <th className="py-3 px-4 text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1d4ed844]">
                      {businessServices.map((s) => (
                        <tr key={s.id} className="hover:bg-[#0b2a8a33]">
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-[#f2f6ff]">{s.name}</p>
                            <p className="text-[10.5px] font-mono text-[#9eb2db]">{s.sku}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[#1ea0ff] font-semibold">{s.category}</span>
                            <span className="block text-[10.5px] text-[#c8d3ea]">{s.packageLevel}</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#c8d3ea]">{s.deliveryTime}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <span className="font-bold text-[#ffd958]">₨{s.recommendedPkr.toLocaleString()}</span>
                            <span className="block text-[10px] text-[#c8d3ea]">${s.optionalUsd.toLocaleString()}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => void toggleServicePublish(s)}
                              className="ob rounded-full px-2.5 py-1 text-[10.5px] font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              {s.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {s.published ? 'Live' : 'Hidden'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteService(s.id, s.name)}
                              aria-label={`Delete ${s.name}`}
                              className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer align-middle"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3 CHANNELS MANAGER */}
          {sectionSubTab === 'section3-channels' && (
            <div className="space-y-4">
              <form onSubmit={handleAddChannel} className="card forms-sample space-y-3">
                <h3 className="text-sm font-extrabold text-[#ffd958] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add New Section 3 LIVE TV Channel
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newChName}
                    onChange={(e) => setNewChName(e.target.value)}
                    placeholder="Channel Name *"
                    className="pb-input px-3 py-2 text-xs"
                  />
                  <select
                    value={newChCat}
                    onChange={(e) => setNewChCat(e.target.value as TvChannelCategory)}
                    className="pb-input px-2.5 py-2 text-xs"
                  >
                    {(['News', 'Sports', 'Entertainment', 'Movies', 'Documentary', 'Kids', 'Regional & World'] as const).map((c) => (
                      <option key={c} value={c} className="bg-[#051239]">{c}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newChCountry}
                    onChange={(e) => setNewChCountry(e.target.value)}
                    placeholder="Country / Region"
                    className="pb-input px-3 py-2 text-xs"
                  />
                  <select
                    value={newChQuality}
                    onChange={(e) => setNewChQuality(e.target.value as '4K UHD' | '1080p HD' | '720p HD')}
                    className="pb-input px-2.5 py-2 text-xs"
                  >
                    <option value="4K UHD" className="bg-[#051239]">4K UHD</option>
                    <option value="1080p HD" className="bg-[#051239]">1080p HD</option>
                    <option value="720p HD" className="bg-[#051239]">720p HD</option>
                  </select>
                  <input
                    type="text"
                    value={newChUrl}
                    onChange={(e) => setNewChUrl(e.target.value)}
                    placeholder="Optional HLS .m3u8 (blank = built-in)"
                    className="pb-input px-3 py-2 text-xs"
                  />
                </div>
                <input
                  type="text"
                  value={newChTagline}
                  onChange={(e) => setNewChTagline(e.target.value)}
                  placeholder="Channel tagline / schedule note..."
                  className="pb-input px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="yb rounded-full px-5 h-8 text-xs font-bold"
                >
                  Save &amp; Publish LIVE TV Channel
                </button>
              </form>

              <div className="edge rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-hover w-full text-left text-xs">
                    <thead className="bg-[#040d29] border-b border-[#2154d4] text-[10.5px] uppercase text-[#c8d3ea]">
                      <tr>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-3">Category &amp; Region</th>
                        <th className="py-3 px-3">Quality &amp; Type</th>
                        <th className="py-3 px-4 text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1d4ed844]">
                      {liveTvChannels.map((ch) => (
                        <tr key={ch.id} className="hover:bg-[#0b2a8a33]">
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-[#f2f6ff]">{ch.name}</p>
                            <p className="text-[10.5px] text-[#9eb2db]">{ch.tagline}</p>
                          </td>
                          <td className="py-2.5 px-3 text-[#c8d3ea]">
                            <span className="text-[#1ea0ff] font-semibold">{ch.category}</span> · {ch.country}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#ffd958]">
                            {ch.quality} · <span className="text-[#c8d3ea]">{ch.streamType}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => void toggleChannelPublish(ch)}
                              className="ob rounded-full px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                            >
                              {ch.published ? 'Live' : 'Hidden'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteChannel(ch.id, ch.name)}
                              aria-label={`Delete ${ch.name}`}
                              className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer align-middle"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3 LIVE TV PLANS MANAGER */}
          {sectionSubTab === 'section3-plans' && (
            <div className="space-y-4">
              <form onSubmit={handleAddPlan} className="card forms-sample space-y-3">
                <h3 className="text-sm font-extrabold text-[#ffd958] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add New Playbeat LIVE TV Streaming Pass
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="Plan Name *"
                    className="pb-input px-3 py-2 text-xs lg:col-span-2"
                  />
                  <select
                    value={newPlanType}
                    onChange={(e) => setNewPlanType(e.target.value as LiveTvPlan['lineType'])}
                    className="pb-input px-2.5 py-2 text-xs"
                  >
                    <option value="Xtream Line" className="bg-[#051239]">Xtream Line</option>
                    <option value="ActiveCode (APK / ISO)" className="bg-[#051239]">ActiveCode (APK / ISO)</option>
                    <option value="Multi-Screen Family" className="bg-[#051239]">Multi-Screen Family</option>
                  </select>
                  <input
                    type="text"
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(e.target.value)}
                    placeholder="Duration (e.g. 6 Months)"
                    className="pb-input px-3 py-2 text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={newPlanUsd}
                      onChange={(e) => setNewPlanUsd(e.target.value)}
                      placeholder="USD"
                      className="pb-input px-2.5 py-2 text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={newPlanConns}
                      onChange={(e) => setNewPlanConns(e.target.value)}
                      placeholder="Conns"
                      className="pb-input px-2.5 py-2 text-xs font-mono w-16"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={newPlanFeatures}
                  onChange={(e) => setNewPlanFeatures(e.target.value)}
                  placeholder="Features (one per line)..."
                  className="pb-input px-3 py-2 text-xs resize-none"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="yb rounded-full px-5 h-8 text-xs font-bold"
                >
                  Save &amp; Publish TV Pass
                </button>
              </form>

              <div className="grid md:grid-cols-3 gap-4">
                {liveTvPlans.map((pl) => (
                  <div key={pl.id} className="edge rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#1ea0ff] font-bold">{pl.sku}</span>
                      <span className="font-mono text-[#ffd958] font-bold">${pl.priceUsd.toFixed(2)}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#f2f6ff]">{pl.name}</h4>
                    <p className="text-[11px] text-[#c8d3ea]">
                      {pl.lineType} · {pl.durationLabel} · {pl.connections} Conn(s)
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#1d4ed844]">
                      <button
                        type="button"
                        onClick={() => void togglePlanPublish(pl)}
                        className="ob rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer"
                      >
                        {pl.published ? 'Published' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deletePlan(pl.id, pl.name)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB 4: ORDERS & SERVICE INQUIRIES DESK ══════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Service Proposal Inquiries */}
          <section className="card forms-sample space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#f2f6ff] flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#ffd958]" />
                Section 2 Business Service Proposals ({serviceInquiries.length})
              </h2>
            </div>

            {serviceInquiries.length === 0 ? (
              <p className="text-xs text-[#c8d3ea]">
                No custom service proposal inquiries yet. When a client clicks &ldquo;Proposal&rdquo; on any Section 2 Business Service, it appears here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {serviceInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-xl bg-[#040d29aa] border border-[#1d4ed866] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#ffd958] font-bold">{inq.id}</span>
                        <span className="font-bold text-[#f2f6ff]">{inq.serviceName}</span>
                      </div>
                      <p className="text-[#c8d3ea]">
                        {inq.customerName} ({inq.customerEmail})
                        {inq.companyName ? ` · ${inq.companyName}` : ''}
                        {inq.customerPhone ? ` · ${inq.customerPhone}` : ''}
                      </p>
                      {inq.notes && <p className="text-[11px] text-[#9eb2db]">{inq.notes}</p>}
                    </div>

                    <select
                      value={inq.status}
                      onChange={(e) =>
                        void handleInquiryStatus(inq.id, e.target.value as ServiceInquiry['status'])
                      }
                      aria-label={`Status for ${inq.id}`}
                      className="pb-input px-3 py-1.5 text-xs w-auto font-bold"
                    >
                      {(['NEW', 'CONTACTED', 'QUOTED', 'WON'] as const).map((st) => (
                        <option key={st} value={st} className="bg-[#051239]">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Unified Orders Desk (All 3 Sections) */}
          <div className="-mx-4 sm:-mx-6 -my-8">
            <OrdersView
              orders={orders}
              onRefreshOrders={onRefreshAll}
              onOrderUpdated={onOrderUpdated}
              onShowToast={onShowToast}
            />
          </div>
        </div>
      )}

      {/* ══════════════ TAB 5: IZOKO CRM & CATALOG (ADMIN ONLY) ══════════════ */}
      {activeTab === 'crm' && (
        <IzokoCrmView
          digitalProducts={digitalProducts}
          businessServices={businessServices}
          liveTvChannels={liveTvChannels}
          liveTvPlans={liveTvPlans}
          serviceInquiries={serviceInquiries}
          onInquiryStatusChange={handleInquiryStatusChange}
          onRefreshAll={onRefreshAll}
        />
      )}

      {activeTab === 'crm-platform' && <CrmPlatformView onShowToast={onShowToast} />}

      {activeTab === 'live' && (
        <PlaybeatLivePanel
          onNavigate={(destination) => {
            if (destination === 'iptv') navigateAdmin('live');
            if (destination === 'business') navigateAdmin('diagnostics');
          }}
        />
      )}

      {activeTab === 'diagnostics' && (
        <div className="-mx-4 sm:-mx-6 -my-8">
          <IntegrationsView
            readiness={readiness}
            syncStatus={syncStatus}
            webhookLogs={webhookLogs}
            onRefreshDiagnostics={onRefreshAll}
            onSyncElectronicFirst={onSyncElectronicFirst}
            onShowToast={onShowToast}
          />
        </div>
      )}
          </main>
          <footer className="footer">
            <div className="container-fluid">
              <div className="d-sm-flex justify-content-center justify-content-sm-between py-2 w-100">
                <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">© {new Date().getFullYear()} Playbeat Digital · Connected storefront administration</span>
                <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">Celestial Bootstrap UI by BootstrapDash</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
