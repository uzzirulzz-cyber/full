const LIVE_DASHBOARD_ORIGIN = 'https://playbeat-storefront.crdbixx.workers.dev';

interface UpstreamLiveSource {
  connected: boolean;
  error?: string;
  [key: string]: unknown;
}

async function loadUpstreamSource(): Promise<UpstreamLiveSource> {
  if (!process.env.LIVE_DASHBOARD_TOKEN) {
    return { connected: false, error: 'Live dashboard bridge is not configured.' };
  }

  try {
    const res = await fetch(`${LIVE_DASHBOARD_ORIGIN}/api/digital-dashboard`, {
      headers: { Authorization: `Bearer ${process.env.LIVE_DASHBOARD_TOKEN}` },
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
    if (!res.ok) return { connected: false, error: `Live source returned HTTP ${res.status}.` };
    const text = await res.text();
    if (text.length > 1_000_000) return { connected: false, error: 'Live source returned an unexpected response.' };
    const data = JSON.parse(text) as Record<string, unknown>;
    if (data.schemaVersion !== 1) return { connected: false, error: 'Live source returned an unsupported schema.' };
    return { connected: true, ...data };
  } catch {
    return { connected: false, error: 'Live source could not be reached. Retry to refresh.' };
  }
}

export async function getPlaybeatLiveDashboard(rawDays: unknown) {
  const requestedDays = Number(rawDays);
  const days = [7, 14, 30, 90].includes(requestedDays) ? requestedDays : 7;
  const source = await loadUpstreamSource();

  return {
    fetchedAt: new Date().toISOString(),
    days,
    timezone: 'UTC',
    autoRefreshSeconds: 60,
    source,
    traffic: {
      connected: false,
      startedAt: null,
      views: null,
      sessions: null,
      playRequests: null,
      sources: [],
      daily: [],
      reason: 'The first-party PlayBeat.live events store is not connected to this deployment.',
    },
    google: {
      ga4: process.env.GA4_MEASUREMENT_ID || '',
      gtm: process.env.GTM_CONTAINER_ID || '',
      adsense: process.env.ADSENSE_CLIENT_ID || '',
      adsEnabled: false,
      source: 'PlayBeat Digital environment settings',
      ga4ReportsConnected: false,
      adsenseRevenueConnected: false,
      liveInstallation: source.google || null,
      observation: null,
    },
    commerce: {
      connected: false,
      reason: 'PlayBeat.live checkout is not connected yet; Digital orders remain separate.',
    },
    inquiries: {
      connected: false,
      reason: 'No PlayBeat.live inquiry or messaging source is connected yet.',
    },
    rule: 'Digital is the main admin. Live release settings and real activity stay separate; Digital figures are never substituted for Live reports.',
  };
}
