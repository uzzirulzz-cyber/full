import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminAuth';

interface FacebookPage {
  id: string;
  name: string;
  link?: string;
  fan_count?: number;
  followers_count?: number;
}

interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  pageName?: string;
}

interface WhatsAppAccount {
  id: string;
  name?: string;
  phoneNumbers: Array<{
    id: string;
    display_phone_number?: string;
    verified_name?: string;
    quality_rating?: string;
    code_verification_status?: string;
  }>;
  error: string | null;
}

interface MetaReport {
  configured: boolean;
  generatedAt: string;
  cached?: boolean;
  identity?: { name: string } | null;
  facebook: { connected: boolean; pages: FacebookPage[]; error: string | null };
  instagram: { connected: boolean; accounts: InstagramAccount[]; error: string | null };
  whatsapp: { connected: boolean; messagingReady: boolean; accounts: WhatsAppAccount[]; error: string | null };
}

const number = new Intl.NumberFormat('en-US');

function ChannelHeader({ icon, title, connected, readyLabel }: { icon: string; title: string; connected: boolean; readyLabel?: string }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h4 className="font-weight-bold mb-0"><i className={`typcn ${icon} mr-2`} />{title}</h4>
      <span className={`badge ${connected ? 'badge-success' : 'badge-warning'}`}>{connected ? readyLabel || 'Connected' : 'Not connected'}</span>
    </div>
  );
}

export function MetaSocialPanel() {
  const [report, setReport] = useState<MetaReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    adminFetch(`/api/admin/meta-social${refreshKey ? '?refresh=1' : ''}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Meta integration returned HTTP ${response.status}.`);
        setReport(data as MetaReport);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : 'Meta integration could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshKey]);

  return (
    <section className="celestial-meta-panel" aria-labelledby="meta-social-title">
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-3">
        <div>
          <h3 className="font-weight-bold mb-1" id="meta-social-title">Meta business channels</h3>
          <p className="text-muted mb-0">Verified Facebook, Instagram and WhatsApp Business access from Meta Graph API.</p>
        </div>
        <div className="d-flex align-items-center mt-2 mt-md-0">
          {report && <small className="text-muted mr-3">{report.cached ? 'Cached report' : 'Live report'} · {new Date(report.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small>}
          <button type="button" className="btn btn-sm btn-outline-primary" disabled={loading} onClick={() => setRefreshKey((value) => value + 1)}><i className={`typcn typcn-refresh-outline mr-1 ${loading ? 'celestial-spin' : ''}`} />Refresh</button>
        </div>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}<button type="button" className="btn btn-sm btn-danger ml-3" onClick={() => setRefreshKey((value) => value + 1)}>Try again</button></div>}
      <div className="row">
        <div className="col-lg-4 d-flex grid-margin stretch-card">
          <div className="card celestial-meta-card celestial-meta-facebook"><div className="card-body">
            <ChannelHeader icon="typcn-social-facebook" title="Facebook" connected={report?.facebook.connected || false} />
            {loading && <p className="text-muted">Checking Facebook Pages…</p>}
            {!loading && report?.facebook.pages.map((page) => (
              <div key={page.id}>
                <h5 className="font-weight-bold mb-1">{page.name.trim()}</h5>
                <a className="small text-primary" href={page.link || 'https://www.facebook.com/playbeatdigital/'} target="_blank" rel="noreferrer">Open Facebook Page<i className="typcn typcn-arrow-forward-outline ml-1" /></a>
                <div className="row mt-4">
                  <div className="col-6"><small className="text-muted">Followers</small><div className="celestial-meta-value">{number.format(page.followers_count || 0)}</div></div>
                  <div className="col-6"><small className="text-muted">Page likes</small><div className="celestial-meta-value">{number.format(page.fan_count || 0)}</div></div>
                </div>
              </div>
            ))}
            {!loading && report?.facebook.error && <div className="celestial-meta-empty"><i className="typcn typcn-info-large-outline" /><p>{report.facebook.error}</p></div>}
          </div></div>
        </div>

        <div className="col-lg-4 d-flex grid-margin stretch-card">
          <div className="card celestial-meta-card celestial-meta-instagram"><div className="card-body">
            <ChannelHeader icon="typcn-social-instagram" title="Instagram" connected={report?.instagram.connected || false} />
            {loading && <p className="text-muted">Checking Instagram professional accounts…</p>}
            {!loading && report?.instagram.accounts.map((account) => (
              <div key={account.id}>
                <h5 className="font-weight-bold mb-1">@{account.username}</h5>
                <a className="small text-primary" href={`https://www.instagram.com/${account.username}/`} target="_blank" rel="noreferrer">Open Instagram profile<i className="typcn typcn-arrow-forward-outline ml-1" /></a>
                <div className="small text-muted mt-2">Linked to {account.pageName?.trim() || 'Facebook Page'}</div>
                <div className="row mt-3">
                  <div className="col-4"><small className="text-muted">Followers</small><div className="celestial-meta-value">{number.format(account.followers_count || 0)}</div></div>
                  <div className="col-4"><small className="text-muted">Following</small><div className="celestial-meta-value">{number.format(account.follows_count || 0)}</div></div>
                  <div className="col-4"><small className="text-muted">Posts</small><div className="celestial-meta-value">{number.format(account.media_count || 0)}</div></div>
                </div>
              </div>
            ))}
            {!loading && report?.instagram.error && <div className="celestial-meta-empty"><i className="typcn typcn-info-large-outline" /><p>{report.instagram.error}</p></div>}
          </div></div>
        </div>

        <div className="col-lg-4 d-flex grid-margin stretch-card">
          <div className="card celestial-meta-card celestial-meta-whatsapp"><div className="card-body">
            <ChannelHeader icon="typcn-messages" title="WhatsApp" connected={report?.whatsapp.messagingReady || false} readyLabel="Messaging ready" />
            {loading && <p className="text-muted">Checking WhatsApp Business accounts…</p>}
            {!loading && report?.whatsapp.accounts.map((account) => (
              <div key={account.id}>
                <h5 className="font-weight-bold mb-3">{account.name || 'WhatsApp Business'}</h5>
                {account.phoneNumbers.map((phone) => (
                  <div className="celestial-meta-phone" key={phone.id}>
                    <strong>{phone.display_phone_number || phone.verified_name || phone.id}</strong>
                    <span>{phone.verified_name || 'Business phone'} · {phone.code_verification_status || 'Status unavailable'}</span>
                    <small>Quality: {phone.quality_rating || 'Not reported'}</small>
                  </div>
                ))}
                {account.error && <p className="small text-warning">{account.error}</p>}
              </div>
            ))}
            {!loading && report?.whatsapp.error && <div className="celestial-meta-empty"><i className="typcn typcn-info-large-outline" /><p>{report.whatsapp.error}</p><small>The token already has WhatsApp management and messaging permissions. Assigning a WABA is the remaining step.</small></div>}
          </div></div>
        </div>
      </div>
      {report?.identity && <small className="d-block text-muted mb-4">Authenticated as {report.identity.name} · Access token is stored server-side and never exposed to the browser.</small>}
    </section>
  );
}
