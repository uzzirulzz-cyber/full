import type { LiveTvChannel, LiveTvPlan } from '../types/store';
import type { ActiveView } from './Navbar';

interface LiveTvSectionProps {
  channels: LiveTvChannel[];
  plans: LiveTvPlan[];
  globalSearch: string;
  onAddToCart: (sku: string) => void;
  onSelectView: (view: ActiveView) => void;
  onShowToast: (msg: string) => void;
}

/**
 * PlayBeat TV is maintained and deployed as its own production streaming app.
 * Embed that real application here instead of rendering the old placeholder
 * channel/plan records from the commerce catalogue.
 */
export function LiveTvSection(_props: LiveTvSectionProps) {
  return (
    <>
      <main className="max-w-[1440px] mx-auto px-3 sm:px-5 pt-5 pb-4">
        <section id="section3-livetv" className="scroll-mt-20 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <p className="text-[#ffc928] text-[12px] font-bold tracking-wider uppercase">
                PLAYBEAT DIGITAL · SECTION 3
              </p>
              <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold leading-tight mt-1">
                PlayBeat <span className="text-[#1ea0ff]">LIVE TV</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-[#c8d3ea] max-w-2xl">
                Live television, channel discovery and streaming playback.
              </p>
            </div>
            <a
              href="https://stream.playbeattv.buzz"
              target="_blank"
              rel="noopener noreferrer"
              className="ob rounded-full px-5 h-10 inline-flex items-center text-[12px] font-bold bg-[#030a1f66] hover:bg-[#0b2a8a66]"
            >
              Open Live TV
            </a>
          </div>

          <div className="edge rounded-2xl overflow-hidden bg-[#020614]">
            <iframe
              src="https://stream.playbeattv.buzz"
              title="PlayBeat Live TV"
              className="block w-full border-0 bg-[#020614]"
              style={{ height: 'min(82vh, 980px)', minHeight: '720px' }}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>
      </main>
    </>
  );
}
