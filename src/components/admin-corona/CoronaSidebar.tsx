import { useState } from 'react';
import type { AdminTab } from '../AdminPanelView';

interface CoronaSidebarProps {
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  onBackToStorefront: () => void;
  onLock: () => void;
}

const GROUPS: Array<{
  id: string;
  label: string;
  icon: string;
  items: Array<{ id: AdminTab; label: string; icon: string }>;
}> = [
  {
    id: 'catalog',
    label: 'Catalog & inventory',
    icon: 'mdi-shopping',
    items: [
      { id: 'extraction', label: 'Supplier extraction', icon: 'mdi-cloud-download' },
      { id: 'sections', label: 'Storefront sections', icon: 'mdi-view-grid' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales & CRM',
    icon: 'mdi-account-multiple',
    items: [
      { id: 'orders', label: 'Orders & inquiries', icon: 'mdi-receipt' },
      { id: 'crm', label: 'Lead pipeline', icon: 'mdi-account-convert' },
      { id: 'crm-platform', label: 'CRM platform', icon: 'mdi-phone' },
    ],
  },
  {
    id: 'system',
    label: 'System operations',
    icon: 'mdi-settings',
    items: [
      { id: 'live', label: 'PlayBeat.live status', icon: 'mdi-access-point' },
      { id: 'diagnostics', label: 'Gateway diagnostics', icon: 'mdi-heart-pulse' },
    ],
  },
];

export function CoronaSidebar({ activeTab, onNavigate, onBackToStorefront, onLock }: CoronaSidebarProps) {
  const [openGroup, setOpenGroup] = useState<string | null>('catalog');

  const navigate = (tab: AdminTab) => {
    onNavigate(tab);
    document.getElementById('sidebar')?.classList.remove('active');
  };

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar" aria-label="Admin navigation">
      <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
        <button type="button" className="sidebar-brand brand-logo border-0 bg-transparent" onClick={() => navigate('overview')}>
          <img src="/assets/playbeat/logo-header.webp" alt="Playbeat Digital" />
        </button>
        <button type="button" className="sidebar-brand brand-logo-mini border-0 bg-transparent text-white font-weight-bold" onClick={() => navigate('overview')}>
          PB
        </button>
      </div>

      <ul className="nav">
        <li className="nav-item profile">
          <div className="profile-desc">
            <div className="profile-pic">
              <div className="count-indicator">
                <span className="corona-admin-avatar">PB</span>
                <span className="count bg-success" />
              </div>
              <div className="profile-name">
                <h5 className="mb-0 font-weight-normal">Administrator</h5>
                <span>Enterprise workspace</span>
              </div>
            </div>
          </div>
        </li>

        <li className="nav-item nav-category"><span className="nav-link">Main navigation</span></li>
        <li className={`nav-item menu-items ${activeTab === 'overview' ? 'active' : ''}`}>
          <button type="button" className="nav-link w-100 border-0 bg-transparent text-left" onClick={() => navigate('overview')}>
            <span className="menu-icon"><i className="mdi mdi-speedometer" /></span>
            <span className="menu-title">Dashboard</span>
          </button>
        </li>

        {GROUPS.map((group) => {
          const expanded = openGroup === group.id;
          const groupActive = group.items.some((item) => item.id === activeTab);
          return (
            <li key={group.id} className={`nav-item menu-items ${groupActive ? 'active' : ''}`}>
              <button
                type="button"
                className={`nav-link w-100 border-0 bg-transparent text-left ${expanded ? 'menu-expanded' : ''}`}
                aria-expanded={expanded}
                onClick={() => setOpenGroup(expanded ? null : group.id)}
              >
                <span className="menu-icon"><i className={`mdi ${group.icon}`} /></span>
                <span className="menu-title">{group.label}</span>
                <i className="menu-arrow" />
              </button>
              {expanded && (
                <ul className="nav flex-column sub-menu">
                  {group.items.map((item) => (
                    <li key={item.id} className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 border-0 bg-transparent text-left ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => navigate(item.id)}
                      >
                        <i className={`mdi ${item.icon} mr-2`} />{item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}

        <li className="nav-item nav-category"><span className="nav-link">Account</span></li>
        <li className="nav-item menu-items">
          <button type="button" className="nav-link w-100 border-0 bg-transparent text-left" onClick={onBackToStorefront}>
            <span className="menu-icon"><i className="mdi mdi-store" /></span>
            <span className="menu-title">Buyer storefront</span>
          </button>
        </li>
        <li className="nav-item menu-items">
          <button type="button" className="nav-link w-100 border-0 bg-transparent text-left text-danger" onClick={onLock}>
            <span className="menu-icon"><i className="mdi mdi-logout" /></span>
            <span className="menu-title">Lock admin</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
