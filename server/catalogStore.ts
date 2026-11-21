import fs from 'fs';
import path from 'path';
import type {
  BusinessService,
  LiveTvChannel,
  LiveTvPlan,
  Product,
  ServiceInquiry,
} from '../src/types/store.ts';
import { PLAYBEAT_LIVE_TV_CHANNELS, PLAYBEAT_LIVE_TV_PLANS } from './liveTvCatalogData.ts';
import { PLAYBEAT_BUSINESS_SERVICES } from './servicesCatalogData.ts';
import { resolveServiceImage } from '../src/lib/serviceImages.ts';
import { normalizeCatalogProducts } from '../src/lib/catalogProducts.ts';

const SOURCE_STORE_FILE = path.resolve(process.cwd(), 'data', 'playbeat-catalog.json');
const DATA_DIR = process.env.VERCEL ? '/tmp/playbeat-digital' : path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'playbeat-catalog.json');
const SUPPLIER_SNAPSHOT_FILE = path.resolve(process.cwd(), 'public', 'data', 'storefront-index.json');

let supplierSnapshot: Product[] | null = null;

function getSupplierSnapshot(): Product[] {
  if (supplierSnapshot) return supplierSnapshot;
  try {
    const parsed = JSON.parse(fs.readFileSync(SUPPLIER_SNAPSHOT_FILE, 'utf8')) as { products?: Product[] };
    supplierSnapshot = Array.isArray(parsed.products) ? normalizeCatalogProducts(parsed.products) : [];
  } catch {
    supplierSnapshot = [];
  }
  return supplierSnapshot;
}

const LIVE_TV_CATALOG_VERSION = 2;

export interface CatalogState {
  digitalProducts: Product[];
  businessServices: BusinessService[];
  liveTvChannels: LiveTvChannel[];
  liveTvPlans: LiveTvPlan[];
  serviceInquiries: ServiceInquiry[];
  lastPublishedSyncAt: string;
  liveTvCatalogVersion?: number;
}

function buildDefaultState(): CatalogState {
  return {
    digitalProducts: getSupplierSnapshot(),
    businessServices: [...PLAYBEAT_BUSINESS_SERVICES],
    liveTvChannels: [...PLAYBEAT_LIVE_TV_CHANNELS],
    liveTvPlans: [...PLAYBEAT_LIVE_TV_PLANS],
    serviceInquiries: [],
    lastPublishedSyncAt: new Date().toISOString(),
    liveTvCatalogVersion: LIVE_TV_CATALOG_VERSION,
  };
}

function ensureStore(): CatalogState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    if (process.env.VERCEL && fs.existsSync(SOURCE_STORE_FILE)) {
      fs.copyFileSync(SOURCE_STORE_FILE, STORE_FILE);
    } else {
      const initial = buildDefaultState();
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Partial<CatalogState>;
    const defaults = buildDefaultState();
    const hydratedServices = (
      Array.isArray(parsed.businessServices) && parsed.businessServices.length > 0
        ? parsed.businessServices
        : defaults.businessServices
    ).map((service) => ({ ...service, imageUrl: resolveServiceImage(service) }));
    const defaultTvById = new Map(defaults.liveTvChannels.map((c) => [c.id, c]));
    const needsTvMigration =
      parsed.liveTvCatalogVersion !== LIVE_TV_CATALOG_VERSION ||
      !Array.isArray(parsed.liveTvChannels) ||
      parsed.liveTvChannels.length === 0 ||
      parsed.liveTvChannels.some((ch) => !ch.streamUrl || ch.streamUrl.startsWith('internal://'));

    const hydratedChannels: LiveTvChannel[] = needsTvMigration
      ? defaults.liveTvChannels
      : parsed.liveTvChannels!.map((ch) => {
          const def = defaultTvById.get(ch.id);
          const fallbackImg =
            ch.category === 'Sports'
              ? '/assets/playbeat/tv/sports.jpg'
              : ch.category === 'Movies'
                ? '/assets/playbeat/tv/cinema.jpg'
                : ch.category === 'Documentary'
                  ? '/assets/playbeat/tv/space.jpg'
                  : ch.category === 'Kids'
                    ? '/assets/playbeat/tv/kids.jpg'
                    : ch.category === 'Entertainment'
                      ? '/assets/playbeat/tv/entertainment.jpg'
                      : ch.category === 'Regional & World'
                        ? '/assets/playbeat/tv/regional.jpg'
                        : '/assets/playbeat/tv/news.jpg';
          return {
            ...def,
            ...ch,
            streamUrl: ch.streamUrl || def?.streamUrl || '',
            imageUrl: ch.imageUrl || def?.imageUrl || fallbackImg,
            nowPlaying: ch.nowPlaying || def?.nowPlaying || `${ch.name} — Live Broadcast`,
            upNext: ch.upNext || def?.upNext || 'Playbeat Prime Showcase',
          };
        });

    if (needsTvMigration) {
      const upgraded: CatalogState = {
        digitalProducts:
          Array.isArray(parsed.digitalProducts) && parsed.digitalProducts.some((product) => product.supplierVerified === true)
            ? parsed.digitalProducts
            : defaults.digitalProducts,
        businessServices: hydratedServices,
        liveTvChannels: hydratedChannels,
        liveTvPlans:
          Array.isArray(parsed.liveTvPlans) && parsed.liveTvPlans.length > 0
            ? parsed.liveTvPlans
            : defaults.liveTvPlans,
        serviceInquiries: Array.isArray(parsed.serviceInquiries) ? parsed.serviceInquiries : [],
        lastPublishedSyncAt: parsed.lastPublishedSyncAt || defaults.lastPublishedSyncAt,
        liveTvCatalogVersion: LIVE_TV_CATALOG_VERSION,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(upgraded, null, 2), 'utf8');
      return upgraded;
    }

    return {
      digitalProducts:
        Array.isArray(parsed.digitalProducts) && parsed.digitalProducts.some((product) => product.supplierVerified === true)
          ? parsed.digitalProducts
          : defaults.digitalProducts,
      businessServices: hydratedServices,
      liveTvChannels: hydratedChannels,
      liveTvPlans:
        Array.isArray(parsed.liveTvPlans) && parsed.liveTvPlans.length > 0
          ? parsed.liveTvPlans
          : defaults.liveTvPlans,
      serviceInquiries: Array.isArray(parsed.serviceInquiries) ? parsed.serviceInquiries : [],
      lastPublishedSyncAt: parsed.lastPublishedSyncAt || defaults.lastPublishedSyncAt,
      liveTvCatalogVersion: LIVE_TV_CATALOG_VERSION,
    };
  } catch {
    const initial = buildDefaultState();
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function writeStore(state: CatalogState): CatalogState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

export function getCatalogState(): CatalogState {
  return ensureStore();
}

/**
 * Sanitized buyer-facing Section 1 products:
 * Strips confidential ElectronicFirst supplier URLs & internal supplier markers.
 */
export function getBuyerDigitalProducts(): Product[] {
  return ensureStore()
    .digitalProducts.filter((p) => p.published !== false && p.supplierVerified === true)
    .map((p) => ({
      // Keep the existing storefront Product contract while returning only buyer-safe fields.
      // The public cart identifier is PlayBeat's code, never the supplier SKU.
      sku: p.publicCode || `PB-DIG-${p.sku.replace(/[^a-z0-9]/gi, '').slice(-8)}`,
      publicCode: p.publicCode,
      name: p.name,
      category: p.category,
      platform: p.platform,
      region: p.region,
      originalPriceUsd: p.originalPriceUsd,
      priceUsd: p.priceUsd,
      pricePkr: p.pricePkr,
      discountPercent: p.discountPercent,
      stockCount: p.stockCount,
      stockStatus: p.stockStatus,
      deliveryType: p.deliveryType,
      productUrl: '',
      imageUrl: p.imageUrl,
      description: p.description,
      activationGuide: p.activationGuide,
      featured: p.featured,
      published: p.published,
    }));
}

export function getAdminDigitalProducts(): Product[] {
  return ensureStore().digitalProducts;
}

export function replaceSyncedDigitalProducts(synced: Product[]): Product[] {
  const state = ensureStore();
  const existingBySku = new Map(state.digitalProducts.map((p) => [p.sku, p]));
  const merged = synced.map((item, idx) => {
    const prev = existingBySku.get(item.sku);
    return {
      ...item,
      publicCode: prev?.publicCode || `PB-DIG-${String(idx + 101)}`,
      published: prev ? prev.published !== false : true,
      featured: prev?.featured ?? item.featured ?? idx < 7,
      affiliatePartner: false,
      supplierVerified: true,
    };
  });
  // Section 1 is reserved for validated ElectronicFirst supplier products only.
  state.digitalProducts = merged;
  state.lastPublishedSyncAt = new Date().toISOString();
  writeStore(state);
  return state.digitalProducts;
}

export function upsertDigitalProduct(product: Product): Product {
  const state = ensureStore();
  const idx = state.digitalProducts.findIndex((p) => p.sku === product.sku);
  if (idx >= 0) {
    state.digitalProducts[idx] = { ...state.digitalProducts[idx], ...product };
  } else {
    state.digitalProducts.unshift({
      ...product,
      publicCode: product.publicCode || `PB-DIG-${Date.now().toString().slice(-4)}`,
      published: product.published !== false,
      affiliatePartner: product.affiliatePartner ?? true,
    });
  }
  writeStore(state);
  return state.digitalProducts[idx >= 0 ? idx : 0];
}

export function deleteDigitalProduct(sku: string): boolean {
  const state = ensureStore();
  const before = state.digitalProducts.length;
  state.digitalProducts = state.digitalProducts.filter((p) => p.sku !== sku);
  if (state.digitalProducts.length !== before) {
    writeStore(state);
    return true;
  }
  return false;
}

export function upsertBusinessService(service: BusinessService): BusinessService {
  const state = ensureStore();
  const idx = state.businessServices.findIndex((s) => s.id === service.id || s.sku === service.sku);
  if (idx >= 0) {
    state.businessServices[idx] = { ...state.businessServices[idx], ...service };
  } else {
    state.businessServices.unshift(service);
  }
  writeStore(state);
  return state.businessServices[idx >= 0 ? idx : 0];
}

export function deleteBusinessService(id: string): boolean {
  const state = ensureStore();
  const before = state.businessServices.length;
  state.businessServices = state.businessServices.filter((s) => s.id !== id);
  if (state.businessServices.length !== before) {
    writeStore(state);
    return true;
  }
  return false;
}

export function upsertLiveTvChannel(channel: LiveTvChannel): LiveTvChannel {
  const state = ensureStore();
  const idx = state.liveTvChannels.findIndex((c) => c.id === channel.id);
  if (idx >= 0) {
    state.liveTvChannels[idx] = { ...state.liveTvChannels[idx], ...channel };
  } else {
    state.liveTvChannels.unshift(channel);
  }
  writeStore(state);
  return state.liveTvChannels[idx >= 0 ? idx : 0];
}

export function deleteLiveTvChannel(id: string): boolean {
  const state = ensureStore();
  const before = state.liveTvChannels.length;
  state.liveTvChannels = state.liveTvChannels.filter((c) => c.id !== id);
  if (state.liveTvChannels.length !== before) {
    writeStore(state);
    return true;
  }
  return false;
}

export function upsertLiveTvPlan(plan: LiveTvPlan): LiveTvPlan {
  const state = ensureStore();
  const idx = state.liveTvPlans.findIndex((p) => p.id === plan.id || p.sku === plan.sku);
  if (idx >= 0) {
    state.liveTvPlans[idx] = { ...state.liveTvPlans[idx], ...plan };
  } else {
    state.liveTvPlans.unshift(plan);
  }
  writeStore(state);
  return state.liveTvPlans[idx >= 0 ? idx : 0];
}

export function deleteLiveTvPlan(id: string): boolean {
  const state = ensureStore();
  const before = state.liveTvPlans.length;
  state.liveTvPlans = state.liveTvPlans.filter((p) => p.id !== id);
  if (state.liveTvPlans.length !== before) {
    writeStore(state);
    return true;
  }
  return false;
}

export function addServiceInquiry(
  payload: Omit<ServiceInquiry, 'id' | 'status' | 'createdAt'>,
): ServiceInquiry {
  const state = ensureStore();
  const inquiry: ServiceInquiry = {
    ...payload,
    id: `INQ-${Date.now().toString().slice(-6)}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  state.serviceInquiries.unshift(inquiry);
  writeStore(state);
  return inquiry;
}

export function updateServiceInquiryStatus(
  id: string,
  status: ServiceInquiry['status'],
): ServiceInquiry | null {
  const state = ensureStore();
  const idx = state.serviceInquiries.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  state.serviceInquiries[idx] = { ...state.serviceInquiries[idx], status };
  writeStore(state);
  return state.serviceInquiries[idx];
}

/**
 * Unified SKU resolver across ALL 3 storefront sections so checkout locks authoritative
 * USD/PKR prices whether buying a Section 1 Digital Key, Section 2 Business Service, or Section 3 LIVE TV Plan.
 */
export function resolvePurchasableItem(sku: string): {
  sku: string;
  name: string;
  platform: Product['platform'];
  unitPriceUsd: number;
  unitPricePkr: number;
  section: 'section1-digital' | 'section2-services' | 'section3-livetv';
} | null {
  const state = ensureStore();
  const prod = state.digitalProducts.find((p) => p.sku === sku || p.publicCode === sku);
  if (prod) {
    return {
      sku: prod.sku,
      name: prod.name,
      platform: prod.platform,
      unitPriceUsd: prod.priceUsd,
      unitPricePkr: prod.pricePkr,
      section: 'section1-digital',
    };
  }
  const svc = state.businessServices.find((s) => s.sku === sku);
  if (svc) {
    return {
      sku: svc.sku,
      name: svc.name,
      platform: 'Business Service',
      unitPriceUsd: svc.optionalUsd,
      unitPricePkr: svc.recommendedPkr,
      section: 'section2-services',
    };
  }
  const tvPlan = state.liveTvPlans.find((t) => t.sku === sku);
  if (tvPlan) {
    return {
      sku: tvPlan.sku,
      name: tvPlan.name,
      platform: 'Playbeat TV',
      unitPriceUsd: tvPlan.priceUsd,
      unitPricePkr: tvPlan.pricePkr,
      section: 'section3-livetv',
    };
  }
  return null;
}
