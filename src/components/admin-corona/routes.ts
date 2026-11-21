import type { AdminTab } from '../AdminPanelView';

export interface CoronaRouteDefinition {
  tab: AdminTab;
  path: string;
  title: string;
  section: string;
}

export const CORONA_ROUTES: CoronaRouteDefinition[] = [
  { tab: 'overview', path: '/dashboard', title: 'Dashboard', section: 'Playbeat' },
  { tab: 'extraction', path: '/catalog/extraction', title: 'Supplier Extraction', section: 'Catalog & Inventory' },
  { tab: 'sections', path: '/catalog/sections', title: 'Storefront Sections', section: 'Catalog & Inventory' },
  { tab: 'orders', path: '/sales/orders', title: 'Orders & Inquiries', section: 'Sales & CRM' },
  { tab: 'crm', path: '/sales/lead-pipeline', title: 'Lead Pipeline', section: 'Sales & CRM' },
  { tab: 'crm-platform', path: '/sales/crm-platform', title: 'CRM Platform', section: 'Sales & CRM' },
  { tab: 'live', path: '/system/playbeat-live', title: 'PlayBeat.live Status', section: 'System Operations' },
  { tab: 'diagnostics', path: '/system/diagnostics', title: 'Gateway Diagnostics', section: 'System Operations' },
];

export function routeForAdminTab(tab: AdminTab): CoronaRouteDefinition {
  return CORONA_ROUTES.find((route) => route.tab === tab) || CORONA_ROUTES[0];
}

export function adminTabFromLocation(fallback: AdminTab): AdminTab {
  const path = window.location.hash.replace(/^#\/?/, '');
  return CORONA_ROUTES.find((route) => route.path.slice(1) === path)?.tab || fallback;
}
