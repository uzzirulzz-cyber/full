import type { Product, ProductCategory } from '../types/store';

const VALID_CATEGORIES = new Set<ProductCategory>([
  'PC Games',
  'Console Subscriptions',
  'Gift Cards',
  'Software Keys',
  'Security & VPN',
]);

export function normalizeCatalogProduct(product: Product): Product {
  let category = product.category;
  if (!VALID_CATEGORIES.has(category)) {
    const text = `${product.category} ${product.name} ${product.platform}`.toLowerCase();
    if (/\b(vpn|security|antivirus|kaspersky|bitdefender)\b/.test(text)) {
      category = 'Security & VPN';
    } else if (/\b(gift|wallet|card|top.?up|voucher|robux|v-bucks)\b/.test(text)) {
      category = 'Gift Cards';
    } else if (/\b(software|windows|office|microsoft 365)\b/.test(text)) {
      category = 'Software Keys';
    } else if (/\b(xbox|playstation|nintendo|subscription|membership|game pass|plus)\b/.test(text)) {
      category = 'Console Subscriptions';
    } else {
      category = 'PC Games';
    }
  }

  return {
    ...product,
    sku: product.publicCode || product.sku,
    publicCode: product.publicCode || product.sku,
    category,
    productUrl: '',
    supplierVerified: true,
    affiliatePartner: false,
  };
}

export function normalizeCatalogProducts(products: Product[]): Product[] {
  return products.map(normalizeCatalogProduct);
}
