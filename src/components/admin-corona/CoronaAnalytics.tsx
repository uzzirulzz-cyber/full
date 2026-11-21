import type { OrderRecord } from '../../types/store';

export function CoronaAnalytics({ orders }: { orders: OrderRecord[] }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  const series = days.map((day) => {
    const key = day.toISOString().slice(0, 10);
    const dayOrders = orders.filter((order) => order.createdAt.slice(0, 10) === key);
    return {
      label: day.toLocaleDateString('en-GB', { weekday: 'short' }),
      orders: dayOrders.length,
      revenue: dayOrders.filter((order) => order.status === 'PAID_FULFILLED').reduce((sum, order) => sum + order.totalPkr, 0),
    };
  });
  const maxRevenue = Math.max(1, ...series.map((day) => day.revenue));
  const maxOrders = Math.max(1, ...series.map((day) => day.orders));
  const fulfilled = orders.filter((order) => order.status === 'PAID_FULFILLED').length;
  const pending = orders.filter((order) => !['PAID_FULFILLED', 'FAILED', 'EXPIRED'].includes(order.status)).length;
  const failed = orders.filter((order) => ['FAILED', 'EXPIRED'].includes(order.status)).length;

  return (
    <div className="row">
      <div className="col-md-8 grid-margin stretch-card">
        <div className="card"><div className="card-body">
          <h4 className="card-title">Seven-Day Revenue</h4>
          <p className="card-description">Fulfilled PKR revenue by order creation date</p>
          <div className="corona-revenue-chart" role="img" aria-label="Seven-day fulfilled revenue bar chart">
            {series.map((day) => (
              <div key={day.label} className="corona-revenue-column">
                <span className="corona-revenue-value">{day.revenue ? `₨${Math.round(day.revenue / 1000)}k` : '—'}</span>
                <div className="corona-revenue-track"><div className="corona-revenue-bar" style={{ height: `${Math.max(day.revenue ? 6 : 1, (day.revenue / maxRevenue) * 100)}%` }} /></div>
                <span className="corona-revenue-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div></div>
      </div>
      <div className="col-md-4 grid-margin stretch-card">
        <div className="card"><div className="card-body">
          <h4 className="card-title">Order Activity</h4>
          <p className="card-description">Orders created during the same period</p>
          <div className="corona-order-bars">
            {series.map((day) => (
              <div key={day.label} className="corona-order-row">
                <span>{day.label}</span>
                <div className="progress progress-md"><div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(day.orders / maxOrders) * 100}%` }} /></div>
                <strong>{day.orders}</strong>
              </div>
            ))}
          </div>
          <div className="d-flex flex-wrap gap-2 mt-4">
            <span className="badge badge-outline-success">{fulfilled} fulfilled</span>
            <span className="badge badge-outline-warning">{pending} pending</span>
            <span className="badge badge-outline-danger">{failed} failed</span>
          </div>
        </div></div>
      </div>
    </div>
  );
}
