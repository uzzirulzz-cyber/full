import { useState } from 'react';
import type {
  BusinessService,
  LiveTvChannel,
  LiveTvPlan,
  OrderRecord,
  Product,
  ServiceInquiry,
} from '../../types/store';
import { resolveServiceImage } from '../../lib/serviceImages';
import type { AdminTab } from '../AdminPanelView';
import { CoronaAnalytics } from './CoronaAnalytics';

interface CoronaDashboardProps {
  digitalProducts: Product[];
  businessServices: BusinessService[];
  liveTvChannels: LiveTvChannel[];
  liveTvPlans: LiveTvPlan[];
  orders: OrderRecord[];
  serviceInquiries: ServiceInquiry[];
  onNavigate: (tab: AdminTab) => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status: OrderRecord['status']) {
  if (status === 'PAID_FULFILLED') return 'badge-outline-success';
  if (status === 'FAILED' || status === 'EXPIRED') return 'badge-outline-danger';
  return 'badge-outline-warning';
}

function topCounts(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  const total = values.length || 1;
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, percent: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function CoronaDashboard({
  digitalProducts,
  businessServices,
  liveTvChannels,
  liveTvPlans,
  orders,
  serviceInquiries,
  onNavigate,
}: CoronaDashboardProps) {
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Review new customer inquiries', done: false, tab: 'orders' as AdminTab },
    { id: 2, label: 'Verify pending payment orders', done: false, tab: 'orders' as AdminTab },
    { id: 3, label: 'Check worldwide supplier sync', done: false, tab: 'extraction' as AdminTab },
    { id: 4, label: 'Inspect payment gateway readiness', done: false, tab: 'diagnostics' as AdminTab },
  ]);

  const paidOrders = orders.filter((order) => order.status === 'PAID_FULFILLED');
  const revenuePkr = paidOrders.reduce((sum, order) => sum + order.totalPkr, 0);
  const averageOrder = paidOrders.length ? Math.round(revenuePkr / paidOrders.length) : 0;
  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const recentInquiries = [...serviceInquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const railCounts = {
    rapid: orders.filter((order) => order.paymentRail === 'rapid').length,
    paypal: orders.filter((order) => order.paymentRail === 'paypal').length,
    manual: orders.filter((order) => order.paymentRail === 'manual').length,
  };
  const rapidEnd = orders.length ? (railCounts.rapid / orders.length) * 100 : 0;
  const paypalEnd = orders.length ? rapidEnd + (railCounts.paypal / orders.length) * 100 : 0;
  const paymentBackground = orders.length
    ? `conic-gradient(#111111 0 ${rapidEnd}%, #00d25b ${rapidEnd}% ${paypalEnd}%, #ffab00 ${paypalEnd}% 100%)`
    : '#2c2e33';
  const categories = topCounts(digitalProducts.map((product) => product.category));
  const regions = topCounts(digitalProducts.map((product) => product.region || 'Unspecified'));

  const kpis = [
    { value: `₨${revenuePkr.toLocaleString()}`, label: 'Fulfilled revenue', icon: 'mdi-arrow-top-right', tone: 'success', tab: 'orders' as AdminTab },
    { value: digitalProducts.length.toLocaleString(), label: 'Digital products', icon: 'mdi-package-variant', tone: 'success', tab: 'sections' as AdminTab },
    { value: orders.length.toLocaleString(), label: 'Total orders', icon: 'mdi-receipt', tone: 'info', toneClass: 'info', tab: 'orders' as AdminTab },
    { value: businessServices.length.toLocaleString(), label: 'Service packages', icon: 'mdi-briefcase', tone: 'success', tab: 'sections' as AdminTab },
  ];

  return (
    <div>
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card corona-gradient-card">
            <div className="card-body py-0 px-0 px-sm-3">
              <div className="row align-items-center">
                <div className="col-4 col-sm-3 col-xl-2">
                  <img src="/assets/corona/dashboard/Group126@2x.png" className="gradient-corona-img img-fluid" alt="Playbeat operations" />
                </div>
                <div className="col-5 col-sm-7 col-xl-8 p-0">
                  <h4 className="mb-1 mb-sm-0">Playbeat command center</h4>
                  <p className="mb-0 font-weight-normal d-none d-sm-block">Live catalog, orders, services and payment operations in one connected workspace.</p>
                </div>
                <div className="col-3 col-sm-2 col-xl-2 pl-0 text-center">
                  <button type="button" className="btn btn-outline-light btn-rounded get-started-btn" onClick={() => onNavigate('sections')}>Manage catalog</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="col-xl-3 col-sm-6 grid-margin stretch-card">
            <button type="button" className="card w-100 border-0 text-left" onClick={() => onNavigate(kpi.tab)}>
              <div className="card-body">
                <div className="row">
                  <div className="col-9"><div className="d-flex align-items-center align-self-start"><h3 className="mb-0">{kpi.value}</h3></div></div>
                  <div className="col-3"><div className={`icon icon-box-${kpi.tone}`}><span className={`mdi ${kpi.icon} icon-item`} /></div></div>
                </div>
                <h6 className="text-muted font-weight-normal">{kpi.label}</h6>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Payment Mix</h4>
              <div className="aligner-wrapper">
                <div className="corona-payment-ring" style={{ background: paymentBackground }}>
                  <div className="absolute center-content">
                    <h5 className="font-weight-normal text-center mb-2 text-white">{orders.length}</h5>
                    <p className="text-small text-muted text-center mb-0">Total orders</p>
                  </div>
                </div>
              </div>
              {[
                { label: 'Rapid Gateway PKR', count: railCounts.rapid },
                { label: 'PayPal International', count: railCounts.paypal },
                { label: 'Manual Transfer', count: railCounts.manual },
              ].map((rail) => (
                <div key={rail.label} className="bg-gray-dark d-flex flex-row py-3 px-4 rounded mt-3">
                  <div><h6 className="mb-1">{rail.label}</h6><p className="text-muted mb-0">Recorded payment rail</p></div>
                  <div className="align-self-center flex-grow text-right"><h6 className="font-weight-bold mb-0">{rail.count}</h6></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-8 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-row justify-content-between">
                <h4 className="card-title mb-1">Latest Service Inquiries</h4>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onNavigate('orders')}>View all</button>
              </div>
              <div className="row"><div className="col-12"><div className="preview-list">
                {recentInquiries.length === 0 && <p className="text-muted">No customer inquiries yet. New storefront proposals will appear here.</p>}
                {recentInquiries.slice(0, 4).map((inquiry, index) => (
                  <div key={inquiry.id} className="preview-item border-bottom">
                    <div className="preview-thumbnail"><div className={`preview-icon ${index % 2 ? 'bg-success' : 'bg-primary'}`}><i className="mdi mdi-account" /></div></div>
                    <div className="preview-item-content d-sm-flex flex-grow">
                      <div className="flex-grow"><h6 className="preview-subject">{inquiry.serviceName}</h6><p className="text-muted mb-0">{inquiry.customerName} · {inquiry.customerEmail}</p></div>
                      <div className="mr-auto text-sm-right pt-2 pt-sm-0"><p className="text-muted">{formatDate(inquiry.createdAt)}</p><p className="text-muted mb-0">{inquiry.status}</p></div>
                    </div>
                  </div>
                ))}
              </div></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {[
          { title: 'Revenue', value: `₨${revenuePkr.toLocaleString()}`, note: `${paidOrders.length} fulfilled orders`, icon: 'mdi-codepen', color: 'primary', tab: 'orders' as AdminTab },
          { title: 'Sales', value: orders.length.toLocaleString(), note: `${orders.filter((order) => order.status !== 'PAID_FULFILLED').length} awaiting progress`, icon: 'mdi-wallet-travel', color: 'danger', tab: 'orders' as AdminTab },
          { title: 'Average Order', value: `₨${averageOrder.toLocaleString()}`, note: 'Average fulfilled order value', icon: 'mdi-monitor', color: 'success', tab: 'orders' as AdminTab },
          { title: 'Live TV', value: `${liveTvChannels.length} / ${liveTvPlans.length}`, note: 'Published channels and streaming plans', icon: 'mdi-television', color: 'info', tab: 'sections' as AdminTab },
        ].map((card) => (
          <div key={card.title} className="col-sm-4 col-xl-3 grid-margin">
            <button type="button" className="card w-100 border-0 text-left" onClick={() => onNavigate(card.tab)}><div className="card-body">
              <h5>{card.title}</h5>
              <div className="row">
                <div className="col-8 col-sm-12 col-xl-8 my-auto"><div className="d-flex d-sm-block d-md-flex align-items-center"><h2 className="mb-0">{card.value}</h2></div><h6 className="text-muted font-weight-normal">{card.note}</h6></div>
                <div className="col-4 col-sm-12 col-xl-4 text-center text-xl-right"><i className={`icon-lg mdi ${card.icon} text-${card.color} ml-auto`} /></div>
              </div>
            </div></button>
          </div>
        ))}
      </div>

      <CoronaAnalytics orders={orders} />

      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card"><div className="card-body">
            <h4 className="card-title">Order Status</h4>
            <div className="table-responsive"><table className="table">
              <thead><tr><th>Customer</th><th>Order No</th><th>Total</th><th>Products</th><th>Payment</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.length === 0 && <tr><td colSpan={7} className="text-center text-muted">No orders recorded yet.</td></tr>}
                {recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.customerEmail}</td>
                    <td className="text-primary">{order.orderId}</td>
                    <td>{order.currency === 'USD' ? `$${order.totalUsd.toFixed(2)}` : `₨${order.totalPkr.toLocaleString()}`}</td>
                    <td>{order.items[0]?.name || 'Store order'}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}</td>
                    <td className="text-capitalize">{order.paymentRail}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td><div className={`badge ${statusBadge(order.status)}`}>{order.status.replaceAll('_', ' ')}</div></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div></div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 col-xl-4 grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <div className="d-flex flex-row justify-content-between"><h4 className="card-title">Customer Messages</h4><button type="button" className="btn btn-sm btn-link" onClick={() => onNavigate('orders')}>View all</button></div>
            <div className="preview-list">
              {recentInquiries.length === 0 && <p className="text-muted">No customer messages to review.</p>}
              {recentInquiries.slice(0, 4).map((inquiry) => (
                <div key={inquiry.id} className="preview-item border-bottom">
                  <div className="preview-thumbnail"><span className="corona-admin-avatar">{inquiry.customerName.slice(0, 2).toUpperCase()}</span></div>
                  <div className="preview-item-content d-flex flex-grow"><div className="flex-grow">
                    <div className="d-flex d-md-block d-xl-flex justify-content-between"><h6 className="preview-subject">{inquiry.customerName}</h6><p className="text-muted text-small">{formatDate(inquiry.createdAt)}</p></div>
                    <p className="text-muted">{inquiry.notes || inquiry.serviceName}</p>
                  </div></div>
                </div>
              ))}
            </div>
          </div></div>
        </div>

        <div className="col-md-6 col-xl-4 grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title">Service Previews</h4>
            <div className="corona-service-preview">
              {businessServices.slice(0, 3).map((service) => (
                <button key={service.id} type="button" onClick={() => onNavigate('sections')} className="border-0 bg-transparent p-0 text-left">
                  <img src={resolveServiceImage(service)} alt={service.name} loading="lazy" />
                  <p className="mb-0 mt-2 font-weight-medium">{service.name}</p>
                </button>
              ))}
            </div>
          </div></div>
        </div>

        <div className="col-md-12 col-xl-4 grid-margin stretch-card">
          <div className="card"><div className="card-body">
            <h4 className="card-title">Operations Checklist</h4>
            <div className="list-wrapper"><ul className="d-flex flex-column todo-list">
              {tasks.map((task) => (
                <li key={task.id} className={task.done ? 'completed' : undefined}>
                  <div className="form-check"><label className="form-check-label">
                    <input
                      className="checkbox"
                      type="checkbox"
                      checked={task.done}
                      onChange={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))}
                    />{task.label}<i className="input-helper" />
                  </label></div>
                  <button type="button" className="btn btn-sm btn-link" onClick={() => onNavigate(task.tab)}>Open</button>
                </li>
              ))}
            </ul></div>
          </div></div>
        </div>
      </div>

      <div className="row">
        <div className="col-12"><div className="card"><div className="card-body">
          <h4 className="card-title">Catalog Distribution</h4>
          <div className="row">
            {[
              { title: 'Products by category', rows: categories },
              { title: 'Products by activation region', rows: regions },
            ].map((group) => (
              <div key={group.title} className="col-md-6">
                <h6 className="text-muted mb-3">{group.title}</h6>
                <div className="table-responsive"><table className="table"><tbody>
                  {group.rows.map((row) => (
                    <tr key={row.label}><td>{row.label}</td><td className="text-right">{row.count.toLocaleString()}</td><td className="text-right font-weight-medium">{row.percent.toFixed(1)}%</td></tr>
                  ))}
                </tbody></table></div>
              </div>
            ))}
          </div>
        </div></div></div>
      </div>
    </div>
  );
}
