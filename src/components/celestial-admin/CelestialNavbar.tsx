import type { OrderRecord, ServiceInquiry } from '../../types/store';
import type { AdminTab } from '../AdminPanelView';

interface CelestialNavbarProps {
  isSyncing: boolean;
  orders: OrderRecord[];
  inquiries: ServiceInquiry[];
  onNavigate: (tab: AdminTab) => void;
  onSync: () => void;
  onBackToStorefront: () => void;
  onLock: () => void;
}

export function CelestialNavbar({ isSyncing, orders, inquiries, onNavigate, onSync, onBackToStorefront, onLock }: CelestialNavbarProps) {
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === 'NEW').length;
  const pendingOrders = orders.filter((order) => !['PAID_FULFILLED', 'FAILED', 'EXPIRED'].includes(order.status)).length;

  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <button type="button" className="navbar-brand brand-logo border-0 bg-transparent" onClick={() => onNavigate('overview')}><img src="/assets/playbeat/logo-header.webp" alt="Playbeat Digital" /></button>
        <button type="button" className="navbar-brand brand-logo-mini border-0 bg-transparent text-primary font-weight-bold" onClick={() => onNavigate('overview')}>PB</button>
        <button className="navbar-toggler align-self-center d-none d-lg-flex border-0 bg-transparent" type="button" onClick={() => document.body.classList.toggle('sidebar-icon-only')} aria-label="Toggle sidebar width"><span className="typcn typcn-th-menu" /></button>
      </div>
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <ul className="navbar-nav mr-lg-2">
          <li className="nav-item d-none d-lg-flex"><button type="button" className="nav-link border-0 bg-transparent" onClick={() => onNavigate('overview')}>Dashboard</button></li>
          <li className="nav-item d-none d-lg-flex"><button type="button" className="nav-link border-0 bg-transparent" onClick={() => onNavigate('sections')}>Catalog</button></li>
          <li className="nav-item d-none d-lg-flex"><button type="button" className="nav-link border-0 bg-transparent" onClick={() => onNavigate('orders')}>Orders</button></li>
        </ul>
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item d-none d-lg-flex mr-2"><button type="button" className="nav-link border-0 bg-transparent" onClick={() => onNavigate('diagnostics')}>Help</button></li>
          <li className="nav-item d-none d-lg-flex mr-2"><button type="button" className="nav-link border-0 bg-transparent" onClick={onSync} disabled={isSyncing} title="Sync worldwide catalog"><i className={`typcn typcn-refresh ${isSyncing ? 'celestial-spin' : ''}`} /></button></li>

          <li className="nav-item dropdown d-flex">
            <details className="celestial-dropdown">
              <summary className="nav-link count-indicator d-flex justify-content-center align-items-center"><i className="typcn typcn-message-typing" />{newInquiries > 0 && <span className="count bg-success">{newInquiries}</span>}</summary>
              <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list show">
                <p className="mb-0 font-weight-normal float-left dropdown-header">Recent inquiries</p>
                {inquiries.length === 0 && <p className="p-3 mb-0 text-muted">No service inquiries yet.</p>}
                {inquiries.slice(0, 3).map((inquiry) => (
                  <button key={inquiry.id} type="button" className="dropdown-item preview-item text-left" onClick={() => onNavigate('orders')}>
                    <div className="preview-thumbnail"><span className="celestial-avatar">{inquiry.customerName.slice(0, 2).toUpperCase()}</span></div>
                    <div className="preview-item-content flex-grow">
                      <h6 className="preview-subject ellipsis font-weight-normal">{inquiry.customerName}</h6>
                      <p className="font-weight-light small-text mb-0">{inquiry.serviceName} · {inquiry.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            </details>
          </li>

          <li className="nav-item dropdown d-flex">
            <details className="celestial-dropdown">
              <summary className="nav-link count-indicator d-flex align-items-center justify-content-center"><i className="typcn typcn-bell mr-0" />{pendingOrders > 0 && <span className="count bg-danger">{pendingOrders}</span>}</summary>
              <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list show">
                <p className="mb-0 font-weight-normal float-left dropdown-header">Operations</p>
                <button type="button" className="dropdown-item preview-item text-left" onClick={() => onNavigate('orders')}>
                  <div className="preview-thumbnail"><div className="preview-icon bg-warning"><i className="typcn typcn-document-text mx-0" /></div></div>
                  <div className="preview-item-content"><h6 className="preview-subject font-weight-normal">{pendingOrders} orders need attention</h6><p className="font-weight-light small-text mb-0">Review payment and fulfillment status</p></div>
                </button>
                <button type="button" className="dropdown-item preview-item text-left" onClick={() => onNavigate('diagnostics')}>
                  <div className="preview-thumbnail"><div className="preview-icon bg-success"><i className="typcn typcn-cog mx-0" /></div></div>
                  <div className="preview-item-content"><h6 className="preview-subject font-weight-normal">Gateway diagnostics</h6><p className="font-weight-light small-text mb-0">Inspect payment and supplier connections</p></div>
                </button>
              </div>
            </details>
          </li>

          <li className="nav-item nav-profile dropdown">
            <details className="celestial-dropdown">
              <summary className="nav-link pl-0 pr-0"><i className="typcn typcn-user-outline mr-0" /><span className="nav-profile-name">Administrator</span></summary>
              <div className="dropdown-menu dropdown-menu-right navbar-dropdown show">
                <button type="button" className="dropdown-item" onClick={onBackToStorefront}><i className="typcn typcn-home-outline text-primary" />Buyer storefront</button>
                <button type="button" className="dropdown-item" onClick={onLock}><i className="typcn typcn-power text-primary" />Lock admin</button>
              </div>
            </details>
          </li>
        </ul>
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" onClick={() => document.getElementById('sidebar')?.classList.toggle('active')} aria-label="Open navigation"><span className="typcn typcn-th-menu" /></button>
      </div>
    </nav>
  );
}
