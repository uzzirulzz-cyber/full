import type { BusinessService, ServiceCategory } from '../types/store';

const SERVICE_IMAGES: Record<string, string> = {
  'bw-corporate': '/img/services/bw-corp.jpg',
  'bw-enterprise-cms': '/img/services/bw-cms.jpg',
  'bw-custom-portal': '/img/services/bw-portal.jpg',
  'ecom-premium-store': '/img/services/ec-store.jpg',
  'ecom-digital-marketplace': '/img/services/ec-digi.jpg',
  'ecom-premium-platform': '/img/services/ec-plat.jpg',
  'ecom-multicategory-marketplace': '/img/services/ec-multi.jpg',
  'crm-business-dashboard': '/img/services/crm-dash.jpg',
  'crm-sales-leads': '/img/services/crm-sales.jpg',
  'crm-omnichannel': '/img/services/crm-omni.jpg',
  'crm-enterprise-ops': '/img/services/crm-ent.jpg',
  'lead-management-dashboard': '/img/services/lead-dash.jpg',
  'lead-automated-intelligence': '/img/services/lead-auto.jpg',
  'lead-enterprise-pulse': '/img/services/lead-pulse.jpg',
  're-agency-website': '/img/services/re-agency.jpg',
  're-listing-portal': '/img/services/re-portal.jpg',
  're-marketplace-maps': '/img/services/re-maps.jpg',
  'edu-course-website': '/img/services/edu-web.jpg',
  'edu-lms-platform': '/img/services/edu-lms.jpg',
  'edu-ai-language': '/img/services/edu-ai.jpg',
  'fin-analytics-dashboard': '/img/services/fin-dash.jpg',
  'fin-digital-asset-dashboard': '/img/services/fin-asset.jpg',
  'fin-custom-platform': '/img/services/fin-plat.jpg',
  'admin-custom-dashboard': '/img/services/adm-dash.jpg',
  'admin-enterprise-rbac': '/img/services/adm-rbac.jpg',
  'admin-multirole-platform': '/img/services/adm-multi.jpg',
  'auto-workflow': '/img/services/auto-wf.jpg',
  'auto-crm-marketing': '/img/services/auto-crm.jpg',
  'auto-enterprise-suite': '/img/services/auto-ent.jpg',
  'custom-mvp-webapp': '/img/services/cust-mvp.jpg',
  'custom-saas-platform': '/img/services/cust-saas.jpg',
  'custom-enterprise-webapp': '/img/services/cust-ent.jpg',
};

const CATEGORY_IMAGES: Record<ServiceCategory, string> = {
  'Business Websites': '/img/services/bw-corp.jpg',
  'E-Commerce': '/img/services/ec-store.jpg',
  'CRM & Operations': '/img/services/crm-dash.jpg',
  'Lead Generation': '/img/services/lead-dash.jpg',
  'Real Estate': '/img/services/re-agency.jpg',
  Education: '/img/services/edu-web.jpg',
  'FinTech / Dashboards': '/img/services/fin-dash.jpg',
  'Admin Systems': '/img/services/adm-dash.jpg',
  Automation: '/img/services/auto-wf.jpg',
  'Custom Development': '/img/services/cust-mvp.jpg',
};

export function resolveServiceImage(
  service: Pick<BusinessService, 'id' | 'category' | 'imageUrl'>,
): string {
  return service.imageUrl?.trim() || SERVICE_IMAGES[service.id] || CATEGORY_IMAGES[service.category];
}
