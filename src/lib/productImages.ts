import type { Product, ProductCategory } from '../types/store';

const CATEGORY_IMAGES: Record<ProductCategory, string> = {
  'PC Games': '/src/assets/images/cat_pc_keys_1795024331948.jpg',
  'Console Subscriptions': '/src/assets/images/cat_console_pass_1795024332006.jpg',
  'Gift Cards': '/src/assets/images/cat_software_cards_1795024408469.jpg',
  'Software Keys': '/assets/playbeat/pick-7.webp',
  'Security & VPN': '/src/assets/images/cat_software_cards_1795024408469.jpg',
};

export function categoryCardImage(category: ProductCategory): string {
  return CATEGORY_IMAGES[category] || '/assets/playbeat/hero-showcase.webp';
}

export function resolveProductImage(product: Pick<Product, 'imageUrl' | 'category'>): string {
  return product.imageUrl?.trim() || categoryCardImage(product.category);
}
