import type { ElectronicFirstSyncResult, Product, ProductCategory, ProductPlatform } from '../src/types/store.ts';

let activeCatalog: Product[] = [];
let lastSync: ElectronicFirstSyncResult = {
  syncedAt: new Date().toISOString(),
  source: 'unavailable',
  apiConfigured: Boolean(process.env.ELECTRONICFIRST_API_KEY),
  httpStatus: null,
  message: 'Waiting for an authenticated ElectronicFirst catalogue sync.',
  productCount: 0,
  balanceInfo: null,
};

const getBaseUrl = () => (process.env.ELECTRONICFIRST_API_BASE || 'https://www.electronicfirst.com/partners/api/v1').replace(/\/+$/, '');
const getApiKey = () => process.env.ELECTRONICFIRST_API_KEY || '';

function normalizePlatform(raw: string): ProductPlatform {
  const v = raw.toLowerCase();
  if (v.includes('xbox')) return 'Xbox';
  if (v.includes('playstation') || v.includes('psn') || v.includes('ps5') || v.includes('ps4')) return 'PlayStation';
  if (v.includes('steam')) return 'Steam';
  if (v.includes('nintendo') || v.includes('switch')) return 'Nintendo';
  if (v.includes('windows') || v.includes('office') || v.includes('microsoft 365')) return 'Windows / Office';
  if (v.includes('vpn') || v.includes('antivirus') || v.includes('kaspersky') || v.includes('bitdefender')) return 'Multi-Device';
  return 'PC';
}
function normalizeCategory(raw: string, platform: ProductPlatform): ProductCategory {
  const v = raw.toLowerCase();
  if (v.includes('vpn') || v.includes('security') || v.includes('antivirus') || platform === 'Multi-Device') return 'Security & VPN';
  if (v.includes('gift') || v.includes('wallet') || v.includes('card')) return 'Gift Cards';
  if (v.includes('pass') || v.includes('plus') || v.includes('subscription') || v.includes('membership')) return 'Console Subscriptions';
  if (v.includes('software') || platform === 'Windows / Office') return 'Software Keys';
  return 'PC Games';
}
function fallbackImage(category: ProductCategory): string {
  if (category === 'Console Subscriptions') return '/assets/playbeat/cat-console-pass.jpg';
  if (category === 'Gift Cards' || category === 'Software Keys' || category === 'Security & VPN') return '/assets/playbeat/cat-software-cards.jpg';
  return '/assets/playbeat/cat-pc-keys.jpg';
}
function records(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object');
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  for (const key of ['products', 'results', 'items', 'data']) {
    const value = root[key];
    if (Array.isArray(value)) return value.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object');
    if (value && typeof value === 'object') {
      for (const nested of ['products', 'results', 'items']) {
        const list = (value as Record<string, unknown>)[nested];
        if (Array.isArray(list)) return list.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object');
      }
    }
  }
  return [];
}
function pagination(payload: unknown): { lastPage: number; nextUrl?: string } {
  if (!payload || typeof payload !== 'object') return { lastPage: 1 };
  const root = payload as Record<string, unknown>;
  const meta = root.meta && typeof root.meta === 'object' ? root.meta as Record<string, unknown> : {};
  const page = root.pagination && typeof root.pagination === 'object' ? root.pagination as Record<string, unknown> : meta.pagination && typeof meta.pagination === 'object' ? meta.pagination as Record<string, unknown> : {};
  const rawLast = page.last_page ?? page.total_pages ?? page.pages ?? meta.last_page ?? root.last_page;
  const lastPage = Number(rawLast);
  const links = root.links && typeof root.links === 'object' ? root.links as Record<string, unknown> : {};
  const next = links.next ?? page.next;
  return {
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? Math.min(100, Math.floor(lastPage)) : 1,
    nextUrl: typeof next === 'string' && next ? next : undefined,
  };
}
function mapProduct(item: Record<string, unknown>, rate: number): Product | null {
  const sku = String(item.sku ?? item.product_id ?? item.id ?? '').trim();
  const name = String(item.name ?? item.title ?? '').trim();
  const rawPrice = item.price ?? item.sale_price ?? item.wholesale_price ?? item.cost;
  const price = Number(rawPrice);
  const currency = String(item.currency ?? item.price_currency ?? 'USD').toUpperCase();
  if (!sku || !name || !Number.isFinite(price) || price <= 0 || currency !== 'USD') return null;

  const platform = normalizePlatform(String(item.platform ?? name));
  const category = normalizeCategory(String(item.category ?? name), platform);
  const rawRetail = Number(item.retail_price ?? item.rrp ?? item.original_price);
  const hasRetail = Number.isFinite(rawRetail) && rawRetail > price;
  const rawStock = item.stock ?? item.stock_count ?? item.quantity;
  const stockNum = Number(rawStock);
  const stockLabel = String(rawStock ?? item.availability ?? item.status ?? '').toLowerCase();
  const inStock = (Number.isFinite(stockNum) && stockNum > 0) || ['live', 'in stock', 'instock', 'available', 'true'].includes(stockLabel);
  const count = Number.isFinite(stockNum) && stockNum > 0 ? Math.floor(stockNum) : inStock ? 1 : 0;
  const rawImage = item.image_url ?? item.image ?? item.imageUrl ?? item.thumbnail;
  const imageUrl = typeof rawImage === 'string' && /^https:\/\//i.test(rawImage) ? rawImage : fallbackImage(category);

  return {
    sku, name, category, platform,
    region: String(item.region ?? item.activation_region ?? 'Region not specified'),
    originalPriceUsd: Number((hasRetail ? rawRetail : price).toFixed(2)),
    priceUsd: Number(price.toFixed(2)),
    pricePkr: Math.round(price * rate),
    discountPercent: hasRetail ? Math.round(((rawRetail - price) / rawRetail) * 100) : 0,
    stockCount: count,
    stockStatus: count > 25 ? 'In Stock' : count > 0 ? 'Low Stock' : 'Out of Stock',
    deliveryType: 'Instant Digital Key',
    productUrl: '',
    imageUrl,
    description: String(item.description ?? ''),
    activationGuide: String(item.activation_guide ?? item.instructions ?? ''),
    supplierVerified: true,
    affiliatePartner: false,
  };
}

export function getCatalog(): Product[] { return activeCatalog; }
export function getProductBySku(sku: string): Product | undefined { return activeCatalog.find((p) => p.sku === sku); }
export function getLastSyncStatus(): ElectronicFirstSyncResult {
  return { ...lastSync, apiConfigured: Boolean(getApiKey()) };
}

export async function syncElectronicFirstCatalog(): Promise<{ products: Product[]; sync: ElectronicFirstSyncResult }> {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();
  const rate = Number(process.env.USD_TO_PKR_RATE || 278.5);
  if (!apiKey) {
    lastSync = { syncedAt: new Date().toISOString(), source: 'catalog_snapshot', apiConfigured: false, httpStatus: null, message: 'ElectronicFirst Partner API key is not configured; serving the bundled verified supplier snapshot.', productCount: 0, balanceInfo: null };
    return { products: [], sync: lastSync };
  }
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('USD_TO_PKR_RATE must be a positive number.');

  let balanceInfo: string | null = null;
  try {
    const balanceRes = await fetch(`${baseUrl}/balance`, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (balanceRes.ok) {
      const balance = await balanceRes.json() as Record<string, unknown>;
      if (balance.balance !== undefined || balance.credit !== undefined) balanceInfo = String(balance.balance ?? balance.credit);
    }
  } catch { /* Balance is informational only. */ }

  try {
    const collected: Record<string, unknown>[] = [];
    let page = 1;
    let lastPage = 1;
    let nextUrl: string | undefined;
    let finalStatus = 200;
    const visited = new Set<string>();
    while ((nextUrl || page <= lastPage) && page <= 100) {
      const url = nextUrl ? new URL(nextUrl, baseUrl) : new URL(`${baseUrl}/products`);
      if (url.origin !== new URL(baseUrl).origin) throw new Error('Supplier pagination link points outside the configured API host; stopped safely.');
      if (!nextUrl && page > 1) {
        url.searchParams.set('page', String(page));
        url.searchParams.set('per_page', '100');
      }
      if (visited.has(url.toString())) throw new Error('Supplier pagination repeated a page URL; stopped to prevent a loop.');
      visited.add(url.toString());
      const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      finalStatus = response.status;
      if (!response.ok) throw new Error(`Products endpoint returned HTTP ${response.status}.`);
      if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error('Products endpoint did not return JSON.');
      const payload = await response.json() as unknown;
      const list = records(payload);
      if (list.length === 0 && page === 1) throw new Error('Supplier response contained no product records.');
      collected.push(...list);
      const pg = pagination(payload);
      lastPage = pg.lastPage;
      nextUrl = pg.nextUrl;
      if (!nextUrl) page += 1;
      else page = lastPage + 1;
      if (nextUrl && page > 100) break;
    }

    const unique = new Map<string, Product>();
    for (const raw of collected) {
      const product = mapProduct(raw, rate);
      if (product) unique.set(product.sku, product);
    }
    if (unique.size === 0) throw new Error('No products had a valid supplier SKU, name and USD price. Existing catalogue was not overwritten.');
    activeCatalog = [...unique.values()];
    lastSync = { syncedAt: new Date().toISOString(), source: 'live_api', apiConfigured: true, httpStatus: finalStatus, message: `Imported ${activeCatalog.length} validated products from ${collected.length} supplier records across the available catalogue pages.`, productCount: activeCatalog.length, balanceInfo };
    return { products: activeCatalog, sync: lastSync };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown supplier API error.';
    lastSync = { syncedAt: new Date().toISOString(), source: 'unavailable', apiConfigured: true, httpStatus: null, message: `Live catalogue sync failed: ${reason} No unverified catalogue was published.`, productCount: activeCatalog.length, balanceInfo };
    return { products: activeCatalog, sync: lastSync };
  }
}

export async function dispatchPartnerOrder(sku: string, quantity: number, referenceId: string): Promise<{ fulfilledViaApi: boolean; keys: string[]; diagnostic: string }> {
  const apiKey = getApiKey();
  if (!apiKey) return { fulfilledViaApi: false, keys: [], diagnostic: 'ElectronicFirst API credentials are missing; order was not dispatched.' };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return { fulfilledViaApi: false, keys: [], diagnostic: 'Invalid quantity; no supplier order was submitted.' };
  try {
    const response = await fetch(`${getBaseUrl()}/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ sku, quantity, reference: referenceId }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { fulfilledViaApi: false, keys: [], diagnostic: `Supplier rejected the order (HTTP ${response.status}); no keys were issued.` };
    const data = await response.json() as { keys?: unknown; codes?: unknown };
    const returned = Array.isArray(data.keys) ? data.keys : Array.isArray(data.codes) ? data.codes : [];
    const keys = returned.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
    if (keys.length !== quantity) return { fulfilledViaApi: false, keys: [], diagnostic: 'Supplier did not return the expected number of keys; order needs reconciliation.' };
    return { fulfilledViaApi: true, keys, diagnostic: 'Supplier fulfilment confirmed.' };
  } catch (error) {
    return { fulfilledViaApi: false, keys: [], diagnostic: error instanceof Error ? error.message : 'Supplier fulfilment failed.' };
  }
}
