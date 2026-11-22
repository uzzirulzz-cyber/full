import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminAuth';

interface AdSenseMetrics {
  ESTIMATED_EARNINGS: number;
  PAGE_VIEWS_RPM: number;
  IMPRESSIONS: number;
  CLICKS: number;
  IMPRESSIONS_CTR: number;
}

interface AnalyticsMetrics {
  sessions: number;
  users: number;
  pageViews: number;
  engagementRate: number;
}

interface ReportBreakdown {
  label: string;
  value: number;
}

interface DomainReport {
  domain: string;
  url: string;
  adsense: {
    connected: boolean;
    metrics?: AdSenseMetrics | null;
    error: string | null;
  };
  analytics: {
    connected: boolean;
    propertyConfigured?: boolean;
    metrics?: AnalyticsMetrics | null;
    topPages?: ReportBreakdown[];
    sources?: ReportBreakdown[];
    error: string | null;
  };
}

interface GoogleReport {
  configured: boolean;
  generatedAt: string;
  days: number;
  range: { start: string; end: string };
  message: string;
  cached?: boolean;
  setup?: {
    title: string;
    steps: string[];
    secrets: string[];
    variables: string[];
  };
  totals?: {
    adsense: AdSenseMetrics | null;
    analytics: { sessions: number; users: number; pageViews: number } | null;
  };
  domains: DomainReport[];
}

const ranges = [7, 28, 30, 90];
const number = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

function available(value: number | undefined, formatter: (value: number) => string) {
  return value === undefined ? '—' : formatter(value);
}

function BreakdownTable({ title, rows }: { title: string; rows: ReportBreakdown[] }) {
  const maximum = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div>
      <h5 className="font-weight-bold mb-3">{title}</h5>
      {rows.length === 0 && <p className="text-muted small mb-0">No activity recorded in this date range.</p>}
      {rows.map((row) => (
        <div className="celestial-google-breakdown" key={row.label}>
          <div className="d-flex justify-content-between small mb-1">
            <span className="text-truncate mr-2" title={row.label}>{row.label}</span>
            <strong>{number.format(row.value)}</strong>
          </div>
          <div className="progress progress-md"><div className="progress-bar bg-primary" style={{ width: `${(row.value / maximum) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function GoogleMonetizationPanel() {
  const [days, setDays] = useState(28);
  const [report, setReport] = useState<GoogleReport | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('playbeat.digital');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    adminFetch(`/api/admin/google-adsense?days=${days}${refreshKey ? '&refresh=1' : ''}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Google reporting returned HTTP ${response.status}.`);
        setReport(data as GoogleReport);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : 'Google reporting could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => controller.abort();
  }, [days, refreshKey]);

  const selected = report?.domains.find((domain) => domain.domain === selectedDomain) || report?.domains[0];
  const connected = report?.domains.some((domain) => domain.adsense.connected || domain.analytics.connected) || false;
  const adsense = selected?.adsense.metrics;
  const analytics = selected?.analytics.metrics;
  const updatedAt = report ? new Date(report.generatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  return (
    <section className="celestial-google-panel" aria-labelledby="google-monetization-title">
      <div className="card grid-margin">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-start">
            <div className="mb-3">
              <div className="d-flex align-items-center flex-wrap">
                <h3 className="card-title mb-1 mr-3" id="google-monetization-title">Google revenue &amp; audience</h3>
                <span className={`badge ${connected ? 'badge-success' : 'badge-warning'}`}>{connected ? 'Google API connected' : 'Setup required'}</span>
              </div>
              <p className="text-muted mb-0">AdSense earnings and GA4 engagement, reported separately from Playbeat store sales.</p>
            </div>
            <div className="d-flex align-items-center mb-3">
              <label className="sr-only" htmlFor="google-report-range">Google reporting date range</label>
              <select id="google-report-range" className="form-control form-control-sm mr-2" value={days} onChange={(event) => setDays(Number(event.target.value))} disabled={loading}>
                {ranges.map((range) => <option key={range} value={range}>Last {range} days</option>)}
              </select>
              <button type="button" className="btn btn-sm btn-outline-primary text-nowrap" disabled={loading} onClick={() => { setRefreshing(true); setRefreshKey((value) => value + 1); }}>
                <i className={`typcn typcn-refresh-outline mr-1 ${refreshing ? 'celestial-spin' : ''}`} />Refresh
              </button>
            </div>
          </div>

          {loading && <div className="celestial-google-empty" role="status"><span className="spinner-border text-primary mr-3" /><div><strong>Loading Google reports</strong><p className="text-muted mb-0">Requesting authorized AdSense and GA4 data…</p></div></div>}
          {!loading && error && <div className="alert alert-danger mb-0" role="alert"><strong>Report unavailable.</strong> {error}<button type="button" className="btn btn-sm btn-danger ml-3" onClick={() => setRefreshKey((value) => value + 1)}>Try again</button></div>}

          {!loading && !error && report && (
            <>
              <div className="row celestial-google-summary">
                {[
                  { label: 'Estimated AdSense earnings', value: available(report.totals?.adsense?.ESTIMATED_EARNINGS, (value) => money.format(value)), note: 'USD · all reported domains', icon: 'typcn-business-card', tone: 'primary' },
                  { label: 'AdSense page RPM', value: available(report.totals?.adsense?.PAGE_VIEWS_RPM, (value) => money.format(value)), note: 'Revenue per 1,000 page views', icon: 'typcn-chart-line-outline', tone: 'success' },
                  { label: 'Ad impressions', value: available(report.totals?.adsense?.IMPRESSIONS, (value) => compact.format(value)), note: 'Across AdSense domains', icon: 'typcn-eye-outline', tone: 'warning' },
                  { label: 'GA4 sessions', value: available(report.totals?.analytics?.sessions, (value) => compact.format(value)), note: report.totals?.analytics ? 'Sum of all GA4 properties' : 'Requires every GA4 property', icon: 'typcn-group-outline', tone: 'info' },
                ].map((metric) => (
                  <div className="col-sm-6 col-xl-3" key={metric.label}>
                    <div className="celestial-google-summary-card">
                      <div><small className="text-muted">{metric.label}</small><h3 className="font-weight-bold mb-1">{metric.value}</h3><small className="text-muted">{metric.note}</small></div>
                      <i className={`typcn ${metric.icon} text-${metric.tone}`} aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>

              {report.message && (
                <div className={`alert ${connected ? 'alert-warning' : 'alert-info'} celestial-google-notice`} role="status">
                  <div><strong>{connected ? 'Some Google data is unavailable.' : report.setup?.title || 'Google connection required'}</strong><p className="mb-0">{report.message}</p></div>
                  {report.setup && (
                    <details className="mt-3">
                      <summary>View secure setup checklist</summary>
                      <ol className="mt-3 mb-3">{report.setup.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                      <small className="d-block font-weight-bold mb-1">Cloudflare secrets — never enter these in the browser</small>
                      <div className="mb-2">{report.setup.secrets.map((name) => <code className="celestial-google-code" key={name}>{name}</code>)}</div>
                      <small className="d-block font-weight-bold mb-1">Worker configuration</small>
                      <div>{report.setup.variables.map((name) => <code className="celestial-google-code" key={name}>{name}</code>)}</div>
                    </details>
                  )}
                </div>
              )}

              <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 mb-3">
                <h4 className="font-weight-bold mb-1">Domain performance</h4>
                <small className="text-muted">{report.range.start} – {report.range.end} · {report.cached ? 'Cached report' : 'Fresh report'} · {updatedAt}</small>
              </div>
              <div className="row">
                {report.domains.map((domain) => (
                  <div className="col-md-6 col-xl-4 d-flex" key={domain.domain}>
                    <button type="button" className={`celestial-google-domain ${selected?.domain === domain.domain ? 'is-selected' : ''}`} onClick={() => setSelectedDomain(domain.domain)} aria-pressed={selected?.domain === domain.domain}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong>{domain.domain}</strong>
                        <span className={`celestial-google-dot ${domain.adsense.connected || domain.analytics.connected ? 'is-connected' : ''}`} title={domain.adsense.connected || domain.analytics.connected ? 'At least one Google source connected' : 'Google sources unavailable'} />
                      </div>
                      <div className="row">
                        <div className="col-6"><small className="text-muted">AdSense earnings</small><div className="h5 font-weight-bold mb-0">{available(domain.adsense.metrics?.ESTIMATED_EARNINGS, (value) => money.format(value))}</div></div>
                        <div className="col-6"><small className="text-muted">GA4 sessions</small><div className="h5 font-weight-bold mb-0">{available(domain.analytics.metrics?.sessions, (value) => compact.format(value))}</div></div>
                      </div>
                      <div className="mt-3 small"><span className={domain.adsense.connected ? 'text-success' : 'text-warning'}>{domain.adsense.connected ? 'AdSense live' : 'AdSense unavailable'}</span><span className="text-muted mx-2">·</span><span className={domain.analytics.connected ? 'text-success' : 'text-warning'}>{domain.analytics.connected ? 'GA4 live' : 'GA4 unavailable'}</span></div>
                    </button>
                  </div>
                ))}
              </div>

              {selected && (
                <div className="celestial-google-detail">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                    <div><h4 className="font-weight-bold mb-1">{selected.domain}</h4><small className="text-muted">Real values only — a dash means the source is not connected.</small></div>
                    <a className="btn btn-sm btn-outline-secondary mt-2 mt-md-0" href={selected.url} target="_blank" rel="noreferrer">Visit domain<i className="typcn typcn-arrow-forward-outline ml-1" /></a>
                  </div>
                  <div className="row celestial-google-detail-metrics">
                    {[
                      { group: 'AdSense', label: 'Estimated earnings', value: available(adsense?.ESTIMATED_EARNINGS, (value) => money.format(value)) },
                      { group: 'AdSense', label: 'Page RPM', value: available(adsense?.PAGE_VIEWS_RPM, (value) => money.format(value)) },
                      { group: 'AdSense', label: 'Impressions', value: available(adsense?.IMPRESSIONS, (value) => number.format(value)) },
                      { group: 'AdSense', label: 'Clicks', value: available(adsense?.CLICKS, (value) => number.format(value)) },
                      { group: 'AdSense', label: 'Impression CTR', value: available(adsense?.IMPRESSIONS_CTR, (value) => `${(value * 100).toFixed(2)}%`) },
                      { group: 'GA4', label: 'Sessions', value: available(analytics?.sessions, (value) => number.format(value)) },
                      { group: 'GA4', label: 'Users', value: available(analytics?.users, (value) => number.format(value)) },
                      { group: 'GA4', label: 'Page views', value: available(analytics?.pageViews, (value) => number.format(value)) },
                      { group: 'GA4', label: 'Engagement rate', value: available(analytics?.engagementRate, (value) => `${(value * 100).toFixed(1)}%`) },
                    ].map((metric) => (
                      <div className="col-6 col-md-4 col-xl" key={`${metric.group}-${metric.label}`}>
                        <div className="celestial-google-metric"><small className={metric.group === 'AdSense' ? 'text-primary' : 'text-info'}>{metric.group}</small><span>{metric.label}</span><strong>{metric.value}</strong></div>
                      </div>
                    ))}
                  </div>
                  <div className="row mt-3">
                    <div className="col-lg-6 mb-4">
                      <div className="d-flex justify-content-between align-items-start mb-2"><span className="badge badge-primary">AdSense</span>{!selected.adsense.connected && <small className="text-warning text-right ml-2">{selected.adsense.error}</small>}</div>
                      <p className="small text-muted mb-0">Estimated earnings are not finalized payouts. Google may adjust recent earnings for invalid activity and exchange rates.</p>
                    </div>
                    <div className="col-lg-6 mb-4">
                      <div className="d-flex justify-content-between align-items-start mb-2"><span className="badge badge-info">Google Analytics 4</span>{!selected.analytics.connected && <small className="text-warning text-right ml-2">{selected.analytics.error}</small>}</div>
                      <p className="small text-muted mb-0">Traffic depends on an installed GA4 tag and a property ID mapped to this exact domain.</p>
                    </div>
                  </div>
                  {selected.analytics.connected && (
                    <div className="row celestial-google-breakdowns">
                      <div className="col-lg-6 mb-4"><BreakdownTable title="Top pages" rows={selected.analytics.topPages || []} /></div>
                      <div className="col-lg-6 mb-4"><BreakdownTable title="Traffic channels" rows={selected.analytics.sources || []} /></div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
