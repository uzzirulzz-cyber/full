import type { FormEvent } from 'react';
import type { OrderRecord, ServiceInquiry } from '../../types/store';
import type { AdminTab } from '../AdminPanelView';

interface CoronaNavbarProps {
  isSyncing: boolean;
  search: string;
  inquiries: ServiceInquiry[];
  orders: OrderRecord[];
  onSearchChange: (value: string) => void;
  onNavigate: (tab: AdminTab) => void;
  onSync: () => void;
  onBackToStorefront: () => void;
  onLock: () => void;
}

export function CoronaNavbar({
  isSyncing,
  search,
  inquiries,
  orders,
  onSearchChange,
  onNavigate,
  onSync,
  onBackToStorefront,
  onLock,
}: CoronaNavbarProps) {
  const toggleIconOnly = () => {
    document.body.classList.toggle('sidebar-icon-only');
    document.querySelector('.corona-admin')?.classList.toggle('sidebar-icon-only');
  };
  const toggleOffcanvas = () => document.getElementById('sidebar')?.classList.toggle('active');
  const recentInquiries = inquiries.slice(0, 3);
  const pendingOrders = orders.filter((order) => order.status !== 'PAID_FULFILLED' && order.status !== 'FAILED').length;
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === 'NEW').length;

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    onNavigate('extraction');
  };

  return (
    <nav className="navbar p-0 fixed-top d-flex flex-row">
      <div className="navbar-brand-wrapper d-flex d-lg-none align-items-center justify-content-center">
        <button type="button" className="navbar-brand brand-logo-mini border-0 bg-transparent text-white font-weight-bold" onClick={() => onNavigate('overview')}>PB</button>
      </div>
      <div className="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
        <button className="navbar-toggler align-self-center" type="button" onClick={toggleIconOnly} aria-label="Toggle sidebar width">
          <span className="mdi mdi-menu" />
        </button>

        <ul className="navbar-nav w-100">
          <li className="nav-item w-100">
            <form className="nav-link mt-2 mt-md-0 d-none d-lg-flex search" onSubmit={submitSearch} role="search">
              <input
                type="search"
                className="form-control"
                placeholder="Search products, SKU or platform"
                aria-label="Search products, SKU or platform"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </form>
          </li>
        </ul>

        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item d-none d-lg-block">
            <button type="button" className="nav-link btn btn-success create-new-button border-0" onClick={() => onNavigate('sections')}>
              + Create New Project
            </button>
          </li>
          <li className="nav-item d-none d-lg-block">
            <button type="button" className="nav-link border-0 bg-transparent" onClick={onSync} disabled={isSyncing} title="Sync worldwide catalog">
              <i className={`mdi mdi-refresh ${isSyncing ? 'corona-spin' : ''}`} />
            </button>
          </li>

          <li className="nav-item border-left">
            <details className="corona-dropdown">
              <summary className="nav-link count-indicator cursor-pointer">
                <i className="mdi mdi-email" />
                {newInquiries > 0 && <span className="count bg-success" />}
              </summary>
              <div className="dropdown-menu navbar-dropdown preview-list show">
                <h6 className="p-3 mb-0">Recent inquiries</h6>
                {recentInquiries.length === 0 && <p className="p-3 mb-0 text-muted">No service inquiries yet.</p>}
                {recentInquiries.map((inquiry) => (
                  <button key={inquiry.id} type="button" className="dropdown-item preview-item text-left" onClick={() => onNavigate('orders')}>
                    <div className="preview-thumbnail"><div className="preview-icon bg-dark rounded-circle"><i className="mdi mdi-account text-info" /></div></div>
                    <div className="preview-item-content">
                      <p className="preview-subject ellipsis mb-1">{inquiry.serviceName}</p>
                      <p className="text-muted mb-0">{inquiry.customerName} · {inquiry.status}</p>
                    </div>
                  </button>
                ))}
                <button type="button" className="dropdown-item text-center text-primary" onClick={() => onNavigate('orders')}>View all inquiries</button>
              </div>
            </details>
          </li>

          <li className="nav-item border-left">
            <details className="corona-dropdown">
              <summary className="nav-link count-indicator cursor-pointer">
                <i className="mdi mdi-bell" />
                {pendingOrders > 0 && <span className="count bg-danger" />}
              </summary>
              <div className="dropdown-menu navbar-dropdown preview-list show">
                <h6 className="p-3 mb-0">Operations</h6>
                <button type="button" className="dropdown-item preview-item text-left" onClick={() => onNavigate('orders')}>
                  <div className="preview-thumbnail"><div className="preview-icon bg-dark rounded-circle"><i className="mdi mdi-receipt text-warning" /></div></div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1">{pendingOrders} orders need attention</p>
                    <p className="text-muted ellipsis mb-0">Review payment and fulfillment status</p>
                  </div>
                </button>
                <button type="button" className="dropdown-item preview-item text-left" onClick={() => onNavigate('diagnostics')}>
                  <div className="preview-thumbnail"><div className="preview-icon bg-dark rounded-circle"><i className="mdi mdi-heart-pulse text-success" /></div></div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1">Gateway diagnostics</p>
                    <p className="text-muted ellipsis mb-0">Inspect payment and supplier connections</p>
                  </div>
                </button>
              </div>
            </details>
          </li>

          <li className="nav-item">
            <details className="corona-dropdown">
              <summary className="nav-link cursor-pointer no-caret">
                <div className="navbar-profile">
                  <span className="corona-admin-avatar">PB</span>
                  <p className="mb-0 d-none d-sm-block navbar-profile-name">Administrator</p>
                  <i className="mdi mdi-menu-down d-none d-sm-block" />
                </div>
              </summary>
              <div className="dropdown-menu navbar-dropdown preview-list navbar-profile-dropdown-menu show">
                <h6 className="p-3 mb-0">Admin account</h6>
                <button type="button" className="dropdown-item preview-item text-left" onClick={onBackToStorefront}>
                  <div className="preview-thumbnail"><div className="preview-icon bg-dark rounded-circle"><i className="mdi mdi-store text-success" /></div></div>
                  <div className="preview-item-content"><p className="preview-subject mb-1">Open buyer storefront</p></div>
                </button>
                <button type="button" className="dropdown-item preview-item text-left" onClick={onLock}>
                  <div className="preview-thumbnail"><div className="preview-icon bg-dark rounded-circle"><i className="mdi mdi-logout text-danger" /></div></div>
                  <div className="preview-item-content"><p className="preview-subject mb-1">Lock admin</p></div>
                </button>
              </div>
            </details>
          </li>
        </ul>

        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" onClick={toggleOffcanvas} aria-label="Open navigation">
          <span className="mdi mdi-format-line-spacing" />
        </button>
      </div>
    </nav>
  );
}
