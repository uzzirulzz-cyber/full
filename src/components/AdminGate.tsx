import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { adminLogin, setAdminToken } from '../lib/adminAuth';
import '../celestial-admin/celestial.css';
import '../celestial-admin/integration.css';

interface AdminGateProps {
  onUnlocked: () => void;
  onBackToStorefront: () => void;
}

export function AdminGate({ onUnlocked, onBackToStorefront }: AdminGateProps) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const { token } = await adminLogin(password.trim());
      setAdminToken(token);
      setPassword('');
      onUnlocked();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Admin sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="celestial-admin container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth px-0">
        <div className="row w-100 mx-0">
          <div className="col-lg-4 mx-auto">
            <div className="auth-form-light text-left py-5 px-4 px-sm-5">
              <div className="brand-logo"><img src="/assets/playbeat/logo-header.webp" alt="Playbeat Digital" /></div>
              <h4>Enterprise administration</h4>
              <h6 className="font-weight-light">Sign in to continue to the Celestial workspace.</h6>

              {errorMsg && <div className="alert alert-danger mt-3" role="alert">{errorMsg}</div>}

              <form className="pt-3" onSubmit={handleSubmit}>
                <div className="form-group d-flex search-field">
                  <input
                    type="password"
                    className="form-control h-auto"
                    id="pb-admin-password"
                    autoComplete="current-password"
                    required
                    autoFocus
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Admin password"
                    aria-label="Admin password"
                  />
                </div>
                <div className="mt-3">
                  <button type="submit" disabled={busy || !password.trim()} className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn">
                    {busy ? <><Loader2 className="inline-block h-4 w-4 animate-spin" /> Verifying…</> : 'SIGN IN'}
                  </button>
                </div>
                <div className="my-3 d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Secure 12-hour session</span>
                  <button type="button" onClick={onBackToStorefront} className="auth-link text-muted border-0 bg-transparent">Back to storefront</button>
                </div>
                <p className="text-center mt-4 mb-0 font-weight-light text-muted">
                  Manage products, services, orders, CRM and payment gateways in one workspace.
                </p>
              </form>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
