import {
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Terminal,
  Webhook,
} from 'lucide-react';
import { useState } from 'react';
import type { ElectronicFirstSyncResult, IntegrationReadiness } from '../types/store';

export interface WebhookLogEntry {
  id: string;
  receivedAt: string;
  provider: string;
  eventType: string;
  signatureValid: boolean;
  sessionId?: string;
  orderId?: string;
  payloadSummary: string;
}

interface IntegrationsViewProps {
  readiness: IntegrationReadiness | null;
  syncStatus: ElectronicFirstSyncResult | null;
  webhookLogs: WebhookLogEntry[];
  onRefreshDiagnostics: () => Promise<void>;
  onSyncElectronicFirst: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export function IntegrationsView({
  readiness,
  syncStatus,
  webhookLogs,
  onRefreshDiagnostics,
  onSyncElectronicFirst,
  onShowToast,
}: IntegrationsViewProps) {
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testOutputs, setTestOutputs] = useState<Record<string, { ok: boolean; text: string }>>({});

  const runTest = async (
    key: string,
    url: string,
    body?: Record<string, unknown>,
  ) => {
    setTestingKey(key);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      const ok = Boolean(res.ok && data.ok !== false);
      const text = ok
        ? data.message || JSON.stringify(data).slice(0, 180)
        : data.error || `HTTP ${res.status}`;
      setTestOutputs((prev) => ({ ...prev, [key]: { ok, text } }));
      onShowToast(ok ? `${key} check passed.` : `${key} check returned an error.`);
      await onRefreshDiagnostics();
    } catch (err) {
      setTestOutputs((prev) => ({
        ...prev,
        [key]: { ok: false, text: err instanceof Error ? err.message : 'Request failed' },
      }));
    } finally {
      setTestingKey(null);
    }
  };

  return (
    <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="edge rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[#ffc928] text-[11px] font-bold tracking-wider uppercase">
            Server-Side Proxy Architecture · Zero Client Secrets
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Gateway &amp; <span className="text-[#1ea0ff]">ElectronicFirst Diagnostics</span>
          </h1>
          <p className="text-xs text-[#c8d3ea] mt-1">
            Verify live OAuth2 handshakes, ElectronicFirst Partner API v1 sync, Rapid Gateway PKR sandbox scenarios, and HMAC-SHA256 webhook signatures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onRefreshDiagnostics()}
          className="yb rounded-full px-5 h-9 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {/* 3-Column Integration Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* 1. Rapid Gateway PKR */}
        <section className="edge rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-extrabold text-sm text-[#f2f6ff]">
              <Smartphone className="w-5 h-5 text-[#ffd958]" />
              Rapid Gateway (PKR)
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              {readiness?.rapidGateway.configured ? 'Configured' : 'Env Required'}
            </span>
          </div>

          <div className="text-xs text-[#c8d3ea] space-y-1.5 font-mono bg-[#040d29aa] border border-[#1d4ed855] rounded-xl p-3">
            <div>Merchant ID: <b className="text-[#ffd958]">{readiness?.rapidGateway.merchantId || '1367'}</b></div>
            <div>Environment: <b className="text-[#1ea0ff]">{readiness?.rapidGateway.environment || 'TEST'}</b></div>
            <div>Signing Salt: <b className="text-emerald-300">{readiness?.rapidGateway.signingSaltConfigured ? 'HMAC-SHA256 Loaded' : 'Missing'}</b></div>
            <div className="truncate">Host: {readiness?.rapidGateway.baseUrl || 'https://secure.rapid-gateway.com'}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button
              type="button"
              disabled={testingKey !== null}
              onClick={() => runTest('Rapid Live Auth', '/api/rapid/test-auth', { useSharedSandboxClient: false })}
              className="yb rounded-full h-9 text-[11px] font-bold inline-flex items-center justify-center gap-1"
            >
              {testingKey === 'Rapid Live Auth' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Test Live OAuth
            </button>
            <button
              type="button"
              disabled={testingKey !== null}
              onClick={() => runTest('Rapid Sandbox Auth', '/api/rapid/test-auth', { useSharedSandboxClient: true })}
              className="ob rounded-full h-9 text-[11px] font-bold bg-[#061236] hover:bg-[#0b2a8a] inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              {testingKey === 'Rapid Sandbox Auth' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Test Sandbox
            </button>
          </div>

          {(testOutputs['Rapid Live Auth'] || testOutputs['Rapid Sandbox Auth']) && (
            <div className="rounded-lg bg-[#040d29] border border-[#2154d4] p-2.5 text-[11px] font-mono">
              {Object.entries(testOutputs)
                .filter(([k]) => k.startsWith('Rapid'))
                .map(([k, v]) => (
                  <p key={k} className={v.ok ? 'text-emerald-300' : 'text-amber-300'}>
                    [{k}] {v.text}
                  </p>
                ))}
            </div>
          )}
        </section>

        {/* 2. PayPal International USD */}
        <section className="edge rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-extrabold text-sm text-[#f2f6ff]">
              <CreditCard className="w-5 h-5 text-[#1ea0ff]" />
              PayPal REST v2 (USD)
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              {readiness?.paypal.configured ? 'Configured' : 'Env Required'}
            </span>
          </div>

          <div className="text-xs text-[#c8d3ea] space-y-1.5 font-mono bg-[#040d29aa] border border-[#1d4ed855] rounded-xl p-3">
            <div>Mode: <b className="text-[#1ea0ff] uppercase">{readiness?.paypal.environment || 'sandbox'}</b></div>
            <div>FX Rate: <b className="text-[#ffd958]">1 USD = ₨{readiness?.usdToPkrRate || 278.5}</b></div>
            <div className="truncate">Base: {readiness?.paypal.baseUrl || 'https://api-m.sandbox.paypal.com'}</div>
            <div>Flow: Create Order → Approve → Capture</div>
          </div>

          <button
            type="button"
            disabled={testingKey !== null}
            onClick={() => runTest('PayPal OAuth', '/api/paypal/test-auth')}
            className="yb rounded-full h-9 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 mt-auto"
          >
            {testingKey === 'PayPal OAuth' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Test PayPal OAuth2 Handshake
          </button>

          {testOutputs['PayPal OAuth'] && (
            <div className="rounded-lg bg-[#040d29] border border-[#2154d4] p-2.5 text-[11px] font-mono">
              <p className={testOutputs['PayPal OAuth'].ok ? 'text-emerald-300' : 'text-amber-300'}>
                {testOutputs['PayPal OAuth'].text}
              </p>
            </div>
          )}
        </section>

        {/* 3. ElectronicFirst Partner API v1 */}
        <section className="edge rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-extrabold text-sm text-[#f2f6ff]">
              <Globe className="w-5 h-5 text-[#ffd958]" />
              ElectronicFirst API v1
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              {readiness?.electronicFirst.configured ? 'Key Loaded' : 'Snapshot Mode'}
            </span>
          </div>

          <div className="text-xs text-[#c8d3ea] space-y-1.5 font-mono bg-[#040d29aa] border border-[#1d4ed855] rounded-xl p-3">
            <div>Source: <b className="text-[#ffd958]">{syncStatus?.source || 'catalog_snapshot'}</b></div>
            <div>Worldwide SKUs: <b className="text-[#1ea0ff]">{syncStatus?.productCount ?? 27}</b></div>
            <div>Balance: <b className="text-emerald-300">{syncStatus?.balanceInfo || 'Partner Ready'}</b></div>
            <div className="truncate">GET /products · /balance · POST /orders</div>
          </div>

          <button
            type="button"
            disabled={testingKey !== null}
            onClick={async () => {
              setTestingKey('EF Sync');
              await onSyncElectronicFirst();
              setTestingKey(null);
            }}
            className="yb rounded-full h-9 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 mt-auto"
          >
            {testingKey === 'EF Sync' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sync ElectronicFirst Worldwide
          </button>

          {syncStatus && (
            <div className="rounded-lg bg-[#040d29] border border-[#2154d4] p-2.5 text-[11px] text-[#c8d3ea]">
              {syncStatus.message}
            </div>
          )}
        </section>
      </div>

      {/* Rapid Gateway Sandbox Magic Values + Webhook Audit Trail */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
        <section className="edge rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-[#f2f6ff] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#ffd958]" />
            Rapid Gateway TEST-MODE Magic Amounts
          </h2>
          <p className="text-xs text-[#c8d3ea]">
            In Rapid Gateway TEST mode, use these exact PKR amounts or pick an explicit <code className="text-[#ffd958]">TEST_SCENARIO</code> inside the checkout modal.
          </p>
          <div className="overflow-hidden rounded-xl border border-[#1d4ed866]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#040d29] text-[10.5px] uppercase text-[#c8d3ea]">
                <tr>
                  <th className="py-2 px-3">Amount (PKR)</th>
                  <th className="py-2 px-3">Deterministic Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d4ed844] font-mono">
                {[
                  ['100', 'SUCCESS — Paid & keys issued'],
                  ['200', 'FAILED — Payment declined'],
                  ['300', 'PENDING — Awaiting Raast/wallet'],
                  ['400', 'EXPIRED — Checkout session expired'],
                  ['500', 'TIMEOUT — Provider timeout'],
                ].map(([amt, outcome]) => (
                  <tr key={amt}>
                    <td className="py-2 px-3 font-bold text-[#ffd958]">₨{amt}</td>
                    <td className="py-2 px-3 text-[#c8d3ea]">{outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="edge rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#f2f6ff] flex items-center gap-2">
              <Webhook className="w-4 h-4 text-[#1ea0ff]" />
              Signed Rapid Webhook Audit Log
            </h2>
            <span className="text-[11px] font-mono text-[#c8d3ea]">
              POST /api/webhooks/rapid
            </span>
          </div>

          {webhookLogs.length === 0 ? (
            <div className="rounded-xl bg-[#040d29aa] border border-[#1d4ed855] p-6 text-center text-xs text-[#c8d3ea]">
              <ShieldCheck className="w-7 h-7 mx-auto text-[#1ea0ff] mb-2" />
              No webhook deliveries recorded yet. Trigger a Rapid Gateway checkout and click &ldquo;Trigger Signed Webhook&rdquo; to inspect HMAC-SHA256 verification here.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl bg-[#040d29] border border-[#1d4ed866] p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#ffd958]">{log.eventType}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        log.signatureValid
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/50'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-400/50'
                      }`}
                    >
                      {log.signatureValid ? 'HMAC-SHA256 VALID' : 'INVALID SIGNATURE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c8d3ea] font-mono truncate">
                    {log.orderId ? `Order ${log.orderId} · ` : ''}
                    {log.sessionId || log.payloadSummary}
                  </p>
                  <p className="text-[10px] text-[#8ca3cf]">
                    {new Date(log.receivedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
