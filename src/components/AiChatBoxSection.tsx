/**
 * Chaatbx is the existing PlayBeat AI studio deployed independently.
 * Embed the real application and keep a direct-open path for browsers that
 * restrict embedded Google authentication or third-party storage.
 */
export function AiChatBoxSection() {
  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-5 pt-5 pb-6">
      <section id="section4-ai-chatbox" className="scroll-mt-20 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="text-[#ffc928] text-[12px] font-bold tracking-wider uppercase">
              PLAYBEAT DIGITAL · SECTION 4
            </p>
            <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold leading-tight mt-1">
              AI <span className="text-[#1ea0ff]">CHAT BOX</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-[#c8d3ea] max-w-2xl">
              Your PlayBeat creative AI workspace — chat, explore creative modes and build ideas in one place.
            </p>
          </div>
          <a
            href="https://chat.playbeat.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="ob rounded-full px-5 h-10 inline-flex items-center text-[12px] font-bold bg-[#030a1f66] hover:bg-[#0b2a8a66]"
          >
            Open AI Studio
          </a>
        </div>

        <div className="edge rounded-2xl overflow-hidden bg-[#020614]">
          <iframe
            src="https://chat.playbeat.digital"
            title="PlayBeat Chaatbx AI Studio"
            className="block w-full border-0 bg-[#020614]"
            style={{ height: 'min(88vh, 1080px)', minHeight: '760px' }}
            allow="microphone; autoplay; clipboard-read; clipboard-write; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <p className="px-1 text-[11px] text-[#9eb2db]">
          If Google sign-in is blocked inside the embedded window, use Open AI Studio to sign in directly.
        </p>
      </section>
    </main>
  );
}
