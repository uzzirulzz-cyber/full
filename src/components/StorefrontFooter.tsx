import { Copy, Facebook, Gamepad2, Globe, Instagram, Mail, MapPin, MessageCircle, MonitorPlay, Phone, Radio, Send, Tv, Youtube } from 'lucide-react';
import { useState } from 'react';
import type { ActiveView } from './Navbar';

interface StorefrontFooterProps {
  currentPage: Exclude<ActiveView, 'admin'>;
  onSelectView: (view: ActiveView) => void;
  onShowToast: (msg: string) => void;
}

export function StorefrontFooter({
  currentPage,
  onSelectView,
  onShowToast,
}: StorefrontFooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const nextAction =
    currentPage === 'digital-store'
      ? {
          title: 'Need a Custom Website, CRM, or Automation?',
          subtitle: 'Explore 32 done-for-you Playbeat Digital Business Services.',
          ctaLabel: 'Explore Business Services →',
          target: 'business-services' as const,
        }
      : currentPage === 'business-services'
        ? {
            title: 'Stream Live Broadcast Channels Inside Playbeat',
            subtitle: 'Open Playbeat LIVE TV for real-time HD channels and 4K streaming passes.',
            ctaLabel: 'Watch Playbeat LIVE TV →',
            target: 'live-tv' as const,
          }
        : {
            title: 'Looking for Worldwide Digital Keys & Subscriptions?',
            subtitle: 'Browse instant-delivery games, passes, gift cards, and software keys.',
            ctaLabel: 'Explore Digital Store →',
            target: 'digital-store' as const,
          };

  const handleCopy = (label: string, value: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(value);
    }
    onShowToast(`${label} copied: ${value}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterEmail('');
    onShowToast('Thanks, you are subscribed to Playbeat Digital drops & updates.');
  };

  return (
    <>
      {/* Playbeat CTA Strip */}
      <section className="mt-12 border-y border-[#1d4ed8] bg-gradient-to-r from-[#1b3fb5] via-[#0b1f63] to-[#241f86]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center gap-5">
          <div className="text-center md:text-left md:pl-6">
            <h2 className="text-xl font-bold">{nextAction.title}</h2>
            <p className="text-[13px] font-medium text-[#e6eeff]">{nextAction.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectView(nextAction.target)}
            className="yb rounded-full px-8 h-[38px] inline-flex items-center text-[12px] font-bold shrink-0"
          >
            {nextAction.ctaLabel}
          </button>
          <img
            src="/assets/playbeat/cta-showcase.webp"
            width={296}
            height={78}
            alt=""
            className="hidden md:block ml-auto h-[82px] w-auto -my-3 object-contain"
            loading="lazy"
          />
        </div>
      </section>

      {/* PlayBeat Network — five independent destination tiles */}
      <section aria-label="Explore the PlayBeat network" className="border-y border-[#294b86] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,.22),transparent_65%),linear-gradient(110deg,#07142f,#030817_55%,#101b3d)]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <p className="text-[10px] tracking-[.28em] uppercase font-bold text-[#76b7ff]">The PlayBeat Network</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">One Network. Five Destinations.</h3>
            </div>
            <p className="text-[11px] text-[#aebfdf]">Choose a destination to visit its website.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { name: 'PlayBeat Live', url: 'https://www.playbeat.live', note: 'Live experiences', Icon: Radio },
              { name: 'PlayBeat Arena', url: 'https://www.playbeatarena.online', note: 'Arena network', Icon: Gamepad2 },
              { name: 'PlayBeat Digital', url: 'https://www.playbeatdigital.world', note: 'Digital world', Icon: Globe },
              { name: 'PlayBeat Arena Asia', url: 'https://www.playbeatarena.asia', note: 'Asia destination', Icon: Tv },
              { name: 'PlayBeat TV', url: 'https://www.playbeattv.buzz', note: 'Watch & stream', Icon: MonitorPlay },
            ].map(({ name, url, note, Icon }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${name}`}
                className="group min-h-[104px] rounded-xl border border-[#5477ad66] bg-[#10254a99] px-3 py-3 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-[#66b7ff] hover:bg-[#183867] hover:shadow-[0_10px_30px_rgba(0,90,220,.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78c2ff]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-[#1e4b83] text-[#9bd0ff] group-hover:text-white group-hover:bg-[#2674c9]">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-[9px] tracking-wider uppercase text-[#85a9d7]">Visit ↗</span>
                </div>
                <span>
                  <span className="block text-[12px] font-bold text-white leading-tight">{name}</span>
                  <span className="block text-[10px] text-[#aebfdf] mt-1">{note}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Playbeat Digital Footer — Official Contact Details from Playbeat Source */}
      <footer id="contact" className="bg-[#040d29]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-7 pb-5 grid grid-cols-2 lg:grid-cols-[1.35fr_.95fr_1.1fr_1.2fr_1.4fr] gap-6 text-[11px]">
          <div className="col-span-2 lg:col-span-1">
            <img
              src="/assets/playbeat/logo-footer.webp"
              width={182}
              height={48}
              alt="Playbeat Digital"
              className="h-11 w-auto object-contain"
              loading="lazy"
            />
            <p className="mt-3 text-[11px] font-medium text-[#c8d3ea]">
              Playbeat Digital Private Limited — Worldwide Digital Products, Business Services &amp; LIVE TV.
            </p>
            <p className="mt-2 text-[10.5px] text-[#9eb2db] flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ffd958] shrink-0 mt-0.5" />
              <span>HOUSE 334, Street 6, Jinnahabad, Abbottabad, Pakistan</span>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[13px] mb-3">Explore</h4>
            <ul className="space-y-1.5 text-[11px] text-[#c8d3ea]">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectView('digital-store')}
                  className={`cursor-pointer ${
                    currentPage === 'digital-store'
                      ? 'text-[#ffd958] font-bold'
                      : 'hover:text-[#1ea0ff]'
                  }`}
                >
                  Digital Store
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectView('business-services')}
                  className={`cursor-pointer ${
                    currentPage === 'business-services'
                      ? 'text-[#ffd958] font-bold'
                      : 'hover:text-[#1ea0ff]'
                  }`}
                >
                  Business Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectView('live-tv')}
                  className={`cursor-pointer ${
                    currentPage === 'live-tv'
                      ? 'text-[#ffd958] font-bold'
                      : 'hover:text-[#1ea0ff]'
                  }`}
                >
                  Playbeat LIVE TV
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => window.location.assign('https://admin.playbeat.digital/admin')}
                  className="hover:text-[#ffd958] cursor-pointer"
                >
                  Merchant Admin Portal
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[13px] mb-3">WhatsApp Desks</h4>
            <ul className="space-y-1.5 text-[11px] text-[#c8d3ea]">
              {[
                { label: 'Orders', num: '+92 332 1029333' },
                { label: 'Support', num: '+92 332 1049333' },
                { label: 'Escalations', num: '+92 334 1079333' },
                { label: 'Agency', num: '+92 319 9980011' },
              ].map((line) => (
                <li key={line.num}>
                  <button
                    type="button"
                    onClick={() => handleCopy(`WhatsApp ${line.label}`, line.num)}
                    className="inline-flex items-center gap-1.5 hover:text-[#ffd958] transition-colors cursor-pointer text-left"
                  >
                    <Phone className="w-3 h-3 text-[#1ea0ff] shrink-0" />
                    <span className="font-mono">{line.num}</span>
                    <Copy className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[13px] mb-3">Official Contact</h4>
            <ul className="space-y-1.5 text-[11px] text-[#c8d3ea]">
              <li>
                <button
                  type="button"
                  onClick={() => handleCopy('Support Email', 'support@playbeat.digital')}
                  className="inline-flex items-center gap-1.5 hover:text-[#ffd958] cursor-pointer"
                >
                  <Mail className="w-3 h-3 text-[#ffd958] shrink-0" />
                  <span>support@playbeat.digital</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCopy('Pro Desk Email', 'support@playbeat.pro')}
                  className="inline-flex items-center gap-1.5 hover:text-[#ffd958] cursor-pointer"
                >
                  <Mail className="w-3 h-3 text-[#1ea0ff] shrink-0" />
                  <span>support@playbeat.pro</span>
                </button>
              </li>
              {[
                { label: 'YouTube · @playbeatdigital1', url: 'https://www.youtube.com/@playbeatdigital1', Icon: Youtube },
                { label: 'Facebook · Playbeat Digital', url: 'https://www.facebook.com/playbeatdigital/', Icon: Facebook },
                { label: 'Instagram · @playbeatdigital', url: 'https://www.instagram.com/playbeatdigital/', Icon: Instagram },
                { label: 'WhatsApp · Official Business', url: 'https://api.whatsapp.com/send/?text&username=playbeatdigital0&type=username&app_absent=0', Icon: MessageCircle },
              ].map(({ label, url, Icon }) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#9eb2db] transition-colors hover:text-[#ffd958]"
                  >
                    <Icon className="h-3 w-3 text-[#1ea0ff] shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-[13px] mb-1">Stay Updated</h4>
            <p className="text-[11px] text-[#c8d3ea] mb-3">
              Get Playbeat Digital deals, service launches &amp; LIVE TV alerts.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="ob rounded-full flex items-center bg-[#030a1f99] pl-4 pr-1 h-[32px]"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="bg-transparent outline-none w-full text-[11px] text-[#f2f6ff]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="w-6 h-6 shrink-0 rounded-full bg-[#1ea0ff] hover:bg-[#2f8bff] grid place-items-center text-white cursor-pointer"
              >
                <Send className="w-3 h-3" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[#1d4ed844]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between gap-2 text-[11px] font-medium text-[#c8d3ea]">
            <span>© {new Date().getFullYear()} Playbeat Digital Private Limited. All rights reserved.</span>
            <span>Digital Store &nbsp;|&nbsp; Business Services &nbsp;|&nbsp; LIVE TV</span>
          </div>
        </div>
      </footer>
    </>
  );
}
