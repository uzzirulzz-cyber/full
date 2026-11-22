import { useState } from 'react';
import type { AdminTab } from '../AdminPanelView';

interface CelestialSidebarProps {
  activeTab: AdminTab;
  search: string;
  onSearchChange: (value: string) => void;
  onNavigate: (tab: AdminTab) => void;
  onBackToStorefront: () => void;
  onLock: () => void;
}

const GROUPS: Array<{
  id: string;
  title: string;
  icon: string;
  items: Array<{ id: AdminTab; label: string; icon: string }>;
}> = [
  {
    id: 'catalog',
    title: 'Catalog & inventory',
    icon: 'typcn-briefcase',
    items: [
      { id: 'extraction', label: 'Supplier extraction', icon: 'typcn-cloud-download-outline' },
      { id: 'sections', label: 'Storefront sections', icon: 'typcn-th-large-outline' },
    ],
  },
  {
    id: 'sales',
    title: 'Sales & CRM',
    icon: 'typcn-group-outline',
    items: [
      { id: 'orders', label: 'Orders & inquiries', icon: 'typcn-document-text' },
      { id: 'crm', label: 'Lead pipeline', icon: 'typcn-user-add-outline' },
      { id: 'crm-platform', label: 'CRM platform', icon: 'typcn-phone-outline' },
    ],
  },
  {
    id: 'system',
    title: 'System operations',
    icon: 'typcn-cog-outline',
    items: [
      { id: 'live', label: 'PlayBeat.live status', icon: 'typcn-wi-fi-outline' },
      { id: 'diagnostics', label: 'Gateway diagnostics', icon: 'typcn-heart-outline' },
    ],
  },
];

export function CelestialSidebar({ activeTab, search, onSearchChange, onNavigate, onBackToStorefront, onLock }: CelestialSidebarProps) {
  const [openGroup, setOpenGroup] = useState<string | null>('catalog');

  const navigate = (tab: AdminTab) => {
    onNavigate(tab);
    document.getElementById('sidebar')?.classList.remove('active');
  };

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar" aria-label="Admin navigation">
      <ul className="nav">
        <li className="nav-item">
          <div className="d-flex sidebar-profile">
            <div className="sidebar-profile-image"><span className="celestial-avatar">PB</span><span className="sidebar-status-indicator" /></div>
            <div className="sidebar-profile-name">
              <p className="sidebar-name">Administrator</p>
              <p className="sidebar-designation">Enterprise workspace</p>
            </div>
          </div>
          <div className="nav-search">
            <form className="input-group" onSubmit={(event) => { event.preventDefault(); navigate('extraction'); }}>
              <input type="search" className="form-control" placeholder="Search products..." aria-label="Search products" value={search} onChange={(event) => onSearchChange(event.target.value)} />
              <button type="submit" className="input-group-append input-group-text border-0 bg-transparent" aria-label="Submit product search"><i className="typcn typcn-zoom" /></button>
            </form>
          </div>
          <p className="sidebar-menu-title">Dash menu</p>
        </li>

        <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
          <button type="button" className="nav-link w-100 border-0 bg-transparent text-left" onClick={() => navigate('overview')}>
            <i className="typcn typcn-device-desktop menu-icon" />
            <span className="menu-title">Dashboard <span className="badge badge-primary ml-3">Live</span></span>
          </button>
        </li>

        {GROUPS.map((group) => {
          const expanded = openGroup === group.id;
          return (
            <li key={group.id} className={`nav-item ${group.items.some((item) => item.id === activeTab) ? 'active' : ''}`}>
              <button type="button" className="nav-link w-100 border-0 bg-transparent text-left" aria-expanded={expanded} onClick={() => setOpenGroup(expanded ? null : group.id)}>
                <i className={`typcn ${group.icon} menu-icon`} />
                <span className="menu-title">{group.title}</span>
                <i className="typcn typcn-chevron-right menu-arrow" />
              </button>
              {expanded && (
                <ul className="nav flex-column sub-menu">
                  {group.items.map((item) => (
                    <li key={item.id} className="nav-item">
                      <button type="button" className={`nav-link w-100 border-0 bg-transparent text-left ${activeTab === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                        <i className={`typcn ${item.icon} mr-2`} />{item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}

        <li className="nav-item">
          <p className="sidebar-menu-title">Account</p>
        </li>
        <li className="nav-item">
          <button type="button" className="nav-link w-100 border-0 bg-transparent text-left" onClick={onBackToStorefront}>
            <i className="typcn typcn-home-outline menu-icon" /><span className="menu-title">Buyer storefront</span>
          </button>
        </li>
        <li className="nav-item">
          <button type="button" className="nav-link w-100 border-0 bg-transparent text-left text-danger" onClick={onLock}>
            <i className="typcn typcn-power-outline menu-icon" /><span className="menu-title">Lock admin</span>
          </button>
        </li>
      </ul>
      <ul className="sidebar-legend">
        <li><p className="sidebar-menu-title">Connected</p></li>
        <li className="nav-item"><span className="nav-link">#Catalog</span></li>
        <li className="nav-item"><span className="nav-link">#Orders</span></li>
        <li className="nav-item"><span className="nav-link">#Services</span></li>
      </ul>
    </nav>
  );
}
