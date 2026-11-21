import { AlertCircle, CheckCircle2, KeyRound, Loader2, Phone, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onShowToast: (msg: string) => void;
}

const RECAPTCHA_ID = 'pb-firebase-phone-recaptcha';

export function AuthModal({ onShowToast }: AuthModalProps) {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGitHub,
    signInWithTikTok,
    sendPhoneOtp,
    verifyPhoneOtp,
    hasPendingPhoneOtp,
    resetPhoneOtp,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Phone SMS state
  const [phoneInput, setPhoneInput] = useState('+92');
  const [otpInput, setOtpInput] = useState('');

  if (!isAuthModalOpen) return null;

  const runSocial = async (id: string, label: string, fn: () => Promise<void>) => {
    setErrorMsg(null);
    setBusyProvider(id);
    try {
      await fn();
      onShowToast(`Signed in to Playbeat Digital with ${label}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : `${label} sign-in failed.`);
    } finally {
      setBusyProvider(null);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = phoneInput.replace(/\s+/g, '');
    if (!cleaned.startsWith('+') || cleaned.length < 10) {
      setErrorMsg('Enter your full phone number including country code (e.g. +923321029333).');
      return;
    }
    setBusyProvider('phone-send');
    try {
      await sendPhoneOtp(cleaned, RECAPTCHA_ID);
      onShowToast(`SMS verification code sent to ${cleaned}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not send SMS code.');
    } finally {
      setBusyProvider(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (otpInput.trim().length < 6) {
      setErrorMsg('Enter the 6-digit SMS code sent to your phone.');
      return;
    }
    setBusyProvider('phone-verify');
    try {
      await verifyPhoneOtp(otpInput.trim());
      setOtpInput('');
      onShowToast('Phone number verified. Welcome to Playbeat Digital!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Playbeat Digital Account Sign Up and Sign In"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xs"
        onClick={closeAuthModal}
      />

      <div className="edge-solid relative z-10 w-full max-w-md rounded-2xl p-6 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close authentication modal"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full border border-[#2154d4] grid place-items-center text-[#f2f6ff] hover:text-[#ffd958] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#07163f] border border-[#1ea0ff] grid place-items-center text-[#ffd958] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#ffc928]">
              Playbeat Digital Account
            </p>
            <h2 className="text-lg font-extrabold text-[#f2f6ff] leading-tight">
              {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="mt-4 grid grid-cols-2 rounded-full border border-[#2154d4] bg-[#040d29] p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`h-8 rounded-full transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-[#ffd958] text-[#030a1f]' : 'text-[#c8d3ea] hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`h-8 rounded-full transition-colors cursor-pointer ${
              mode === 'signin' ? 'bg-[#1ea0ff] text-[#030a1f]' : 'text-[#c8d3ea] hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-500/15 border border-rose-500/50 p-3 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OAuth Providers: Google, Facebook, TikTok, GitHub */}
        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            disabled={busyProvider !== null}
            onClick={() => void runSocial('google', 'Google', signInWithGoogle)}
            className="w-full h-10 rounded-full bg-white text-[#0f172a] hover:bg-slate-100 font-bold text-xs px-4 flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {busyProvider === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.2 0-5.8-2.1-6.8-5H1.2v3.1C3.2 21.3 7.3 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.2 14.2c-.2-.7-.4-1.5-.4-2.2s.1-1.5.4-2.2V6.7H1.2C.4 8.3 0 10.1 0 12s.4 3.7 1.2 5.3l4-3.1Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.7l4 3.1c1-2.9 3.6-5 6.8-5Z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            disabled={busyProvider !== null}
            onClick={() => void runSocial('facebook', 'Facebook', signInWithFacebook)}
            className="w-full h-10 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs px-4 flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {busyProvider === 'facebook' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.6 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.8V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.4v2.3H7.2v3.3h2.9V22h3.5Z" />
              </svg>
            )}
            <span>Continue with Facebook</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={busyProvider !== null}
              onClick={() => void runSocial('tiktok', 'TikTok', signInWithTikTok)}
              className="h-10 rounded-full border border-[#2f8bff]/70 bg-[#040d29] hover:bg-[#0b2a8a] text-[#f2f6ff] font-bold text-xs px-3 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {busyProvider === 'tiktok' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 fill-current text-[#25F4EE]" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.2 2h3.1c.3 2.3 1.7 3.9 3.9 4.2v3.2a7.4 7.4 0 0 1-3.9-1.2v6.9a6.2 6.2 0 1 1-6.2-6.2c.3 0 .7 0 1 .1v3.3a3 3 0 1 0 2.1 2.9V2Z" />
                </svg>
              )}
              <span>TikTok</span>
            </button>

            <button
              type="button"
              disabled={busyProvider !== null}
              onClick={() => void runSocial('github', 'GitHub', signInWithGitHub)}
              className="h-10 rounded-full border border-[#2f8bff]/70 bg-[#0d1633] hover:bg-[#162552] text-[#f2f6ff] font-bold text-xs px-3 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {busyProvider === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.07.78 2.15v3.19c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              )}
              <span>GitHub</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#1d4ed855]" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9eb2db]">
            Or Verify via Phone SMS
          </span>
          <span className="h-px flex-1 bg-[#1d4ed855]" />
        </div>

        {/* Phone SMS OTP Form */}
        {!hasPendingPhoneOtp ? (
          <form onSubmit={handleSendOtp} className="space-y-2.5">
            <label className="block text-[11px] font-semibold text-[#c8d3ea]">
              Mobile Number (with Country Code)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-3.5 h-3.5 text-[#1ea0ff] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+923321029333"
                  className="pb-input pl-8 pr-3 py-2 text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={busyProvider !== null}
                className="yb rounded-full px-4 h-9 text-xs font-bold shrink-0 inline-flex items-center gap-1.5"
              >
                {busyProvider === 'phone-send' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5" />
                )}
                Send SMS
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-2.5">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/40 px-3 py-2 text-[11px] text-emerald-200 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Code sent to <b className="font-mono">{phoneInput}</b>
              </span>
              <button
                type="button"
                onClick={resetPhoneOtp}
                className="underline text-[#ffd958] font-bold cursor-pointer"
              >
                Change
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit SMS OTP"
                className="pb-input px-3 py-2 text-xs font-mono tracking-widest text-center"
              />
              <button
                type="submit"
                disabled={busyProvider !== null}
                className="yb rounded-full px-5 h-9 text-xs font-bold shrink-0 inline-flex items-center gap-1.5"
              >
                {busyProvider === 'phone-verify' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Verify
              </button>
            </div>
          </form>
        )}

        {/* Invisible reCAPTCHA container required by Firebase Phone Auth */}
        <div id={RECAPTCHA_ID} />

        <p className="mt-4 text-[10.5px] text-center text-[#9eb2db] leading-relaxed">
          Secured by Firebase Authentication. Your profile &amp; LIVE TV watchlist sync privately to your account.
        </p>
      </div>
    </div>
  );
}
