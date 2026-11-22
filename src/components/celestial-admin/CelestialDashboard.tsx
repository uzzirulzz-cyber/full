import type {
  BusinessService,
  ElectronicFirstSyncResult,
  IntegrationReadiness,
  LiveTvChannel,
  LiveTvPlan,
  OrderRecord,
  Product,
  ServiceInquiry,
} from '../../types/store';
import type { AdminTab } from '../AdminPanelView';
import { GoogleMonetizationPanel } from './GoogleMonetizationPanel';
import { MetaSocialPanel } from './MetaSocialPanel';

interface CelestialDashboardProps {
  digitalProducts: Product[];
  businessServices: BusinessService[];
  liveTvChannels: LiveTvChannel[];
  liveTvPlans: LiveTvPlan[];
  orders: OrderRecord[];
  serviceInquiries: ServiceInquiry[];
  readiness: IntegrationReadiness | null;
  syncStatus: ElectronicFirstSyncResult | null;
  onNavigate: (tab: AdminTab) => void;
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusClass(status: string) {
  if (status === 'PAID_FULFILLED' || status === 'WON') return 'text-success';
  if (status === 'FAILED' || status === 'EXPIRED' || status === 'LOST') return 'text-danger';
  return 'text-warning';
}

export function CelestialDashboard({
  digitalProducts,
  businessServices,
  liveTvChannels,
  liveTvPlans,
  orders,
  serviceInquiries,
  readiness,
  syncStatus,
  onNavigate,
}: CelestialDashboardProps) {
  const paidOrders = orders.filter((order) => order.status === 'PAID_FULFILLED');
  const revenue = paidOrders.reduce((sum, order) => sum + order.totalPkr, 0);
  const averageOrder = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;
  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentInquiries = [...serviceInquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const publishedProducts = digitalProducts.filter((product) => product.published !== false);
  const inStock = publishedProducts.filter((product) => product.stockStatus !== 'Out of Stock').length;
  const railCounts = {
    rapid: orders.filter((order) => order.paymentRail === 'rapid').length,
    paypal: orders.filter((order) => order.paymentRail === 'paypal').length,
    manual: orders.filter((order) => order.paymentRail === 'manual').length,
  };
  const rapidEnd = orders.length ? (railCounts.rapid / orders.length) * 100 : 0;
  const paypalEnd = orders.length ? rapidEnd + (railCounts.paypal / orders.length) * 100 : 0;
  const paymentBackground = orders.length
    ? `conic-gradient(#0090e7 0 ${rapidEnd}%, #00d25b ${rapidEnd}% ${paypalEnd}%, #ffab00 ${paypalEnd}% 100%)`
    : '#e9ecef';

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const dayOrders = orders.filter((order) => order.createdAt.slice(0, 10) === key);
    return {
      label: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      orders: dayOrders.length,
      revenue: dayOrders.filter((order) => order.status === 'PAID_FULFILLED').reduce((sum, order) => sum + order.totalPkr, 0),
    };
  });
  const maxRevenue = Math.max(1, ...week.map((day) => day.revenue));
  const categoryCounts = Object.values(digitalProducts.reduce<Record<string, number>>((groups, product) => {
    groups[product.category] = (groups[product.category] || 0) + 1;
    return groups;
  }, {})).sort((a, b) => b - a).slice(0, 5);
  const categoryRows = Object.entries(digitalProducts.reduce<Record<string, number>>((groups, product) => {
    groups[product.category] = (groups[product.category] || 0) + 1;
    return groups;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const exportOrders = () => {
    const rows = [
      ['Order ID', 'Customer', 'Rail', 'Total USD', 'Total PKR', 'Status', 'Created'],
      ...orders.map((order) => [order.orderId, order.customerEmail, order.paymentRail, order.totalUsd, order.totalPkr, order.status, order.createdAt]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'playbeat-orders.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="celestial-dashboard">
      <div className="row">
        <div className="col-sm-6">
          <h3 className="mb-0 font-weight-bold">Playbeat Enterprise</h3>
          <p>Secure admin session · live storefront data</p>
        </div>
        <div className="col-sm-6">
          <div className="d-flex align-items-center justify-content-md-end">
            <div className="mb-3 mb-xl-0 pr-1"><span className="badge badge-light">Last 7 days</span></div>
            <div className="pr-1 mb-3 mr-2 mb-xl-0">
              <button type="button" className="btn btn-sm bg-white btn-icon-text border" onClick={exportOrders}><i className="typcn typcn-arrow-forward-outline mr-2" />Export</button>
            </div>
            <div className="pr-1 mb-3 mb-xl-0">
              <button type="button" className="btn btn-sm bg-white btn-icon-text border" onClick={() => onNavigate('diagnostics')}><i className="typcn typcn-info-large-outline mr-2" />Info</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-xl-5 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">Sessions by Channel</h4>
            <div className="row align-items-center">
              <div className="col-lg-6"><div className="celestial-payment-ring" style={{ background: paymentBackground }}><div className="celestial-ring-center"><strong>{orders.length}</strong><span>Orders</span></div></div></div>
              <div className="col-lg-6">
                <ul className="session-by-channel-legend">
                  <li><div>Rapid Gateway ({railCounts.rapid})</div><div>{orders.length ? ((railCounts.rapid / orders.length) * 100).toFixed(0) : 0}%</div></li>
                  <li><div>PayPal ({railCounts.paypal})</div><div>{orders.length ? ((railCounts.paypal / orders.length) * 100).toFixed(0) : 0}%</div></li>
                  <li><div>Manual ({railCounts.manual})</div><div>{orders.length ? ((railCounts.manual / orders.length) * 100).toFixed(0) : 0}%</div></li>
                </ul>
              </div>
            </div>
          </div></div>
        </div>

        <div className="col-xl-3 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">Events</h4>
            <div className="d-flex justify-content-between mb-md-5 mt-3"><div className="small">Orders</div><div className="text-warning small">Pending</div><div className="text-danger small">Failed</div></div>
            {[
              { label: 'Fulfilled', value: paidOrders.length, className: 'bg-success' },
              { label: 'Awaiting payment or review', value: orders.filter((order) => !['PAID_FULFILLED', 'FAILED', 'EXPIRED'].includes(order.status)).length, className: 'bg-warning' },
              { label: 'Failed or expired', value: orders.filter((order) => ['FAILED', 'EXPIRED'].includes(order.status)).length, className: 'bg-danger' },
            ].map((event) => (
              <div key={event.label} className="mb-3"><div className="d-flex justify-content-between mb-1"><small>{event.label}</small><strong>{event.value}</strong></div><div className="progress progress-md"><div className={`progress-bar ${event.className}`} style={{ width: `${orders.length ? (event.value / orders.length) * 100 : 0}%` }} /></div></div>
            ))}
          </div></div>
        </div>

        <div className="col-xl-4 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">Store health</h4>
            {[
              ['Supplier source', syncStatus?.source || 'catalog_snapshot'],
              ['Published products', `${publishedProducts.length.toLocaleString()} / ${digitalProducts.length.toLocaleString()}`],
              ['In-stock products', inStock.toLocaleString()],
              ['Payment environment', readiness?.rapidGateway.environment || 'TEST'],
              ['Live TV', `${liveTvChannels.length} channels · ${liveTvPlans.length} plans`],
            ].map(([label, value]) => <div key={label} className="d-flex justify-content-between mb-4"><div>{label}</div><div className="text-muted">{value}</div></div>)}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onNavigate('diagnostics')}>Open diagnostics</button>
          </div></div>
        </div>
      </div>

      <GoogleMonetizationPanel />
      <MetaSocialPanel />

      <div className="row">
        <div className="col-xl-3 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">Revenue Summary</h4>
            {[
              ['Fulfilled revenue', `₨${revenue.toLocaleString()}`],
              ['Average order', `₨${averageOrder.toLocaleString()}`],
              ['Fulfilled orders', paidOrders.length.toLocaleString()],
              ['Service packages', businessServices.length.toLocaleString()],
            ].map(([label, value]) => <div key={label} className="d-flex justify-content-between mb-4"><div className="text-secondary font-weight-medium">{label}</div><div className="font-weight-bold">{value}</div></div>)}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onNavigate('orders')}>Open orders</button>
          </div></div>
        </div>

        <div className="col-xl-6 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <div className="d-flex flex-wrap justify-content-between"><h4 className="card-title mb-3">Sales Analytics</h4><span className="badge badge-light">Last 7 days</span></div>
            <div className="d-md-flex mb-4">
              <div className="mr-md-5 mb-4"><h5 className="mb-1"><i className="typcn typcn-globe-outline mr-1" />Revenue</h5><h2 className="text-primary mb-1 font-weight-bold">₨{revenue.toLocaleString()}</h2></div>
              <div className="mr-md-5 mb-4"><h5 className="mb-1"><i className="typcn typcn-archive mr-1" />Orders</h5><h2 className="text-secondary mb-1 font-weight-bold">{orders.length}</h2></div>
              <div className="mr-md-5 mb-4"><h5 className="mb-1"><i className="typcn typcn-tags mr-1" />Products</h5><h2 className="text-warning mb-1 font-weight-bold">{digitalProducts.length.toLocaleString()}</h2></div>
            </div>
            <div className="celestial-revenue-chart" role="img" aria-label="Seven-day revenue chart">
              {week.map((day) => (
                <div key={day.label} className="celestial-revenue-column"><span>{day.revenue ? `₨${Math.round(day.revenue / 1000)}k` : '—'}</span><div className="celestial-revenue-track"><div className="celestial-revenue-bar" style={{ height: `${Math.max(day.revenue ? 6 : 1, (day.revenue / maxRevenue) * 100)}%` }} /></div><small>{day.label}</small></div>
              ))}
            </div>
          </div></div>
        </div>

        <div className="col-xl-3 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">Order Activity</h4>
            {week.map((day) => (
              <div key={day.label} className="celestial-order-row"><span>{day.label}</span><div className="progress progress-md"><div className="progress-bar bg-primary" style={{ width: `${(day.orders / Math.max(1, ...week.map((item) => item.orders))) * 100}%` }} /></div><strong>{day.orders}</strong></div>
            ))}
            <div className="mt-4"><small className="text-muted">Orders created each day</small></div>
          </div></div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">E-Commerce Analytics</h4>
            <div className="row">
              <div className="col-lg-9">
                <div className="table-responsive"><table className="table table-hover">
                  <thead><tr><th>Customer</th><th>Order</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentOrders.length === 0 && <tr><td colSpan={6} className="text-center text-muted">No orders recorded yet.</td></tr>}
                    {recentOrders.map((order) => (
                      <tr key={order.orderId}><td>{order.customerEmail}</td><td className="text-primary">{order.orderId}</td><td>{order.currency === 'USD' ? `$${order.totalUsd.toFixed(2)}` : `₨${order.totalPkr.toLocaleString()}`}</td><td className="text-capitalize">{order.paymentRail}</td><td>{dateLabel(order.createdAt)}</td><td className={`${statusClass(order.status)} font-weight-bold`}>{order.status.replaceAll('_', ' ')}</td></tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
              <div className="col-lg-3">
                <div><div className="d-flex justify-content-between mb-3"><div className="text-success font-weight-bold">Inbound</div></div>
                  {[
                    ['Current', `₨${revenue.toLocaleString()}`],
                    ['Average', `₨${averageOrder.toLocaleString()}`],
                    ['Maximum', `₨${Math.max(0, ...paidOrders.map((order) => order.totalPkr)).toLocaleString()}`],
                    ['Order count', orders.length.toLocaleString()],
                  ].map(([label, value]) => <div key={label} className="d-flex justify-content-between mb-3"><div className="font-weight-medium">{label}</div><div className="text-muted">{value}</div></div>)}
                </div><hr />
                <div className="mt-4"><div className="d-flex justify-content-between mb-3"><div className="text-success font-weight-bold">Catalog</div></div>
                  <div className="d-flex justify-content-between mb-3"><div className="font-weight-medium">Published</div><div className="text-muted">{publishedProducts.length.toLocaleString()}</div></div>
                  <div className="d-flex justify-content-between"><div className="font-weight-medium">In stock</div><div className="text-muted">{inStock.toLocaleString()}</div></div>
                </div>
              </div>
            </div>
          </div></div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">Catalog Analysis</h4>
            {categoryRows.map(([category, count], index) => (
              <div key={category} className="mt-3"><div className="d-flex justify-content-between"><small>{category}</small><small>{count.toLocaleString()}</small></div><div className="progress progress-md mt-2"><div className={`progress-bar ${['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-secondary'][index]}`} style={{ width: `${(count / Math.max(1, ...categoryCounts)) * 100}%` }} /></div></div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary mt-4" onClick={() => onNavigate('sections')}>Manage catalog</button>
          </div></div>
        </div>

        <div className="col-lg-8 d-flex grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title mb-3">Project status</h4>
            <div className="table-responsive"><table className="table">
              <tbody>
                {recentInquiries.length === 0 && <tr><td className="text-center text-muted">No service inquiries recorded yet.</td></tr>}
                {recentInquiries.map((inquiry) => {
                  const service = businessServices.find((item) => item.id === inquiry.serviceId || item.sku === inquiry.serviceId || item.name === inquiry.serviceName);
                  return (
                    <tr key={inquiry.id}>
                      <td><div className="d-flex"><span className="celestial-avatar mr-2">{inquiry.customerName.slice(0, 2).toUpperCase()}</span><div><div>{inquiry.customerName}</div><div className="font-weight-bold mt-1">{inquiry.serviceName}</div></div></div></td>
                      <td>Budget<div className="font-weight-bold mt-1">{service ? `₨${service.recommendedPkr.toLocaleString()}` : 'Custom'}</div></td>
                      <td>Status<div className={`${statusClass(inquiry.status)} font-weight-bold mt-1`}>{inquiry.status}</div></td>
                      <td>Received<div className="font-weight-bold mt-1">{dateLabel(inquiry.createdAt)}</div></td>
                      <td><button type="button" className="btn btn-sm btn-secondary" onClick={() => onNavigate('orders')}>Open</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
