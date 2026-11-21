import {
  ArrowUpDown,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileJson,
  Globe,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ElectronicFirstSyncResult, Product } from '../types/store';

interface CatalogTableViewProps {
  products: Product[];
  externalSearch?: string;
  syncStatus: ElectronicFirstSyncResult | null;
  isSyncing: boolean;
  onSyncApi: () => void;
  onTogglePublish: (product: Product) => void;
  onShowToast: (msg: string) => void;
}

type SortKey = 'name' | 'priceUsd' | 'discountPercent' | 'stockCount';

export function CatalogTableView({
  products,
  externalSearch,
  syncStatus,
  isSyncing,
  onSyncApi,
  onTogglePublish,
  onShowToast,
}: CatalogTableViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('discountPercent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
    if (externalSearch !== undefined) setSearch(externalSearch);
  }, [externalSearch]);

  useEffect(() => {
    setVisibleCount(100);
  }, [search, categoryFilter, platformFilter, sortKey, sortDir]);

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );
  const platforms = useMemo(
    () => ['ALL', ...Array.from(new Set(products.map((p) => p.platform)))],
    [products],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
        if (platformFilter !== 'ALL' && p.platform !== platformFilter) return false;
        if (
          q &&
          !p.name.toLowerCase().includes(q) &&
          !p.sku.toLowerCase().includes(q) &&
          !(p.publicCode || '').toLowerCase().includes(q) &&
          !p.platform.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp =
          typeof av === 'string' && typeof bv === 'string'
            ? av.localeCompare(bv)
            : Number(av) - Number(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [products, search, categoryFilter, platformFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = [
      'Supplier SKU',
      'Playbeat Public Code',
      'Product Name',
      'Category',
      'Platform',
      'Region',
      'Price USD',
      'Price PKR',
      'Original MSRP USD',
      'Discount %',
      'Stock Count',
      'Stock Status',
      'Published in Section 1',
      'Confidential Supplier Link',
    ];
    const escapeCsv = (val: string | number | boolean) => `"${String(val).replace(/"/g, '""')}"`;
    const rows = filtered.map((p) =>
      [
        p.sku,
        p.publicCode || '',
        p.name,
        p.category,
        p.platform,
        p.region,
        p.priceUsd.toFixed(2),
        p.pricePkr,
        p.originalPriceUsd.toFixed(2),
        `${p.discountPercent}%`,
        p.stockCount,
        p.stockStatus,
        p.published !== false ? 'Published' : 'Hidden',
        p.productUrl,
      ]
        .map(escapeCsv)
        .join(','),
    );
    downloadFile(
      [headers.join(','), ...rows].join('\n'),
      'playbeat-admin-electronicfirst-worldwide.csv',
      'text/csv',
    );
    onShowToast(`Exported ${filtered.length} Worldwide SKUs to CSV (Admin Export).`);
  };

  const handleExportJson = () => {
    downloadFile(
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          scope: 'admin-confidential',
          region: 'Worldwide',
          source: syncStatus?.source || 'catalog_snapshot',
          count: filtered.length,
          products: filtered,
        },
        null,
        2,
      ),
      'playbeat-admin-electronicfirst-worldwide.json',
      'application/json',
    );
    onShowToast(`Exported ${filtered.length} Worldwide SKUs to JSON (Admin Export).`);
  };

  const publishedCount = products.filter((p) => p.published !== false).length;
  const visibleProducts = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-5">
      <div className="edge rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[#ffc928] text-[11px] font-bold tracking-wider uppercase">
            ADMIN CONFIDENTIAL · ELECTRONICFIRST WORLDWIDE EXTRACTION &amp; SYNC
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
            Worldwide <span className="text-[#1ea0ff]">Supplier Extraction &amp; Section 1 Sync</span>
          </h2>
          <p className="text-xs text-[#c8d3ea] mt-1.5">
            {syncStatus
              ? `${syncStatus.message} (${publishedCount}/${products.length} synced & live as Playbeat affiliate products)`
              : `${publishedCount} of ${products.length} extracted Worldwide products are published to Buyer Section 1 (supplier URLs & SKUs are stripped for buyers).`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isSyncing}
            onClick={onSyncApi}
            className="yb rounded-full px-5 h-9 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing to Section 1...' : 'Sync Partner API → Section 1'}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="ob rounded-full px-4 h-9 text-xs font-bold bg-[#061236] hover:bg-[#0b2a8a] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#ffd958]" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="ob rounded-full px-4 h-9 text-xs font-bold bg-[#061236] hover:bg-[#0b2a8a] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-[#1ea0ff]" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="edge rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto] gap-3 items-center">
        <div className="flex items-center gap-2 pb-input px-3 py-2">
          <Search className="w-4 h-4 text-[#c8d3ea] shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by product name, supplier SKU, Playbeat ID..."
            className="bg-transparent outline-none w-full text-xs text-[#f2f6ff]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className="pb-input px-3 py-2 text-xs"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="bg-[#051239]">
              {c === 'ALL' ? 'All Categories' : c}
            </option>
          ))}
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          aria-label="Filter by platform"
          className="pb-input px-3 py-2 text-xs"
        >
          {platforms.map((pl) => (
            <option key={pl} value={pl} className="bg-[#051239]">
              {pl === 'ALL' ? 'All Platforms' : pl}
            </option>
          ))}
        </select>

        <div className="text-xs font-mono text-[#ffd958] font-bold px-2 text-right">
          {filtered.length} / {products.length} SKUs
        </div>
      </div>

      {/* Admin Structured Extraction Table */}
      <div className="edge rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-hover w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#040d29] border-b border-[#2154d4] text-[11px] uppercase tracking-wider text-[#c8d3ea]">
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    className="inline-flex items-center gap-1 hover:text-[#ffd958] cursor-pointer"
                  >
                    Product · Supplier SKU · Public ID
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Platform</th>
                <th className="py-3.5 px-3">Region</th>
                <th className="py-3.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('priceUsd')}
                    className="inline-flex items-center gap-1 hover:text-[#ffd958] cursor-pointer"
                  >
                    Price (USD / PKR)
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('discountPercent')}
                    className="inline-flex items-center gap-1 hover:text-[#ffd958] cursor-pointer"
                  >
                    Discount
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('stockCount')}
                    className="inline-flex items-center gap-1 hover:text-[#ffd958] cursor-pointer"
                  >
                    Stock
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Supplier Link (Admin)</th>
                <th className="py-3.5 px-4 text-right">Section 1 Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d4ed844]">
              {visibleProducts.map((p) => {
                const isPublished = p.published !== false;
                return (
                  <tr key={p.sku} className="hover:bg-[#0b2a8a44] transition-colors">
                    <td className="py-3 px-4 max-w-[290px]">
                      <div className="font-bold text-[#f2f6ff] leading-snug">{p.name}</div>
                      <div className="text-[10.5px] text-[#9eb2db] font-mono mt-0.5">
                        {p.sku} · <span className="text-[#ffd958]">{p.publicCode || 'PB-AUTO'}</span> ·{' '}
                        {p.category}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-semibold text-[#1ea0ff]">
                      {p.platform}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[#c8d3ea]">
                        <Globe className="w-3.5 h-3.5 text-[#ffd958]" />
                        {p.region}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono tabular-nums">
                      <div className="font-extrabold text-[#ffd958]">${p.priceUsd.toFixed(2)}</div>
                      <div className="text-[10.5px] text-[#c8d3ea]">
                        ₨{p.pricePkr.toLocaleString()} ·{' '}
                        <span className="line-through text-[#8ca3cf]">
                          ${p.originalPriceUsd.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono tabular-nums">
                      <span className="rounded bg-[#ffd958]/15 border border-[#ffd958]/40 px-2 py-0.5 text-[#ffd958] font-bold">
                        -{p.discountPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono tabular-nums">
                      <div
                        className={`font-bold ${
                          p.stockStatus === 'In Stock'
                            ? 'text-emerald-300'
                            : p.stockStatus === 'Low Stock'
                              ? 'text-[#ffd958]'
                              : 'text-rose-400'
                        }`}
                      >
                        {p.stockCount}
                      </div>
                      <div className="text-[10px] text-[#c8d3ea]">{p.stockStatus}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {p.productUrl ? (
                        <a
                          href={p.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#1ea0ff] hover:underline font-semibold"
                        >
                          electronicfirst.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[#8ca3cf]">Playbeat Custom</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onTogglePublish(p)}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isPublished
                            ? 'bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/25'
                            : 'bg-slate-600/20 border border-slate-500/50 text-slate-300 hover:bg-slate-600/35'
                        }`}
                      >
                        {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {isPublished ? 'Published' : 'Hidden'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#9fb1d2]">
        <span>Showing {visibleProducts.length.toLocaleString()} of {filtered.length.toLocaleString()} products</span>
        {visibleProducts.length < filtered.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 100)}
            className="ob rounded-lg bg-[#081a3a] px-4 py-2 font-bold text-[#d6efff] cursor-pointer"
          >
            Load 100 more
          </button>
        )}
      </div>
    </div>
  );
}
