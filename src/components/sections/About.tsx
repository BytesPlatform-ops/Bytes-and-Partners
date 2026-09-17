import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const PRINCIPLES = [
  {
    t: "Engineering, not assembly",
    d: "Architecture, data models and integrations are ours. We do not hand a template to a contractor and forward the invoice.",
  },
  {
    t: "Design that survives contact",
    d: "Empty states, error states, loading states and edge cases are designed with the happy path — because that is where products actually fail.",
  },
  {
    t: "Claims we can evidence",
    d: "Every number on this site traces to a store listing, a Search Console property or a running application. Nothing is estimated.",
  },
  {
    t: "Built to be handed over",
    d: "Documented, conventional, readable code. You should be able to take it in-house whenever you choose to.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-24 overflow-hidden px-5 py-28 sm:px-8 sm:py-36 lg:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-[1320px] -translate-x-1/2 hairline"
      />
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="About the studio"
              title={
                <>
                  A technology studio
                  <br />
                  building intelligent
                  <br />
                  digital products.
                </>
              }
            />
            <Reveal delay={0.16}>
              <div className="mt-7 max-w-xl space-y-5 text-[1.0625rem] leading-relaxed text-titanium">
                <p>
                  Bytes and Partners is a technology company that designs and builds the
                  systems businesses run on — web platforms, mobile applications, CRM and
                  admin tooling, AI agents and the automation that connects them.
                </p>
                <p>
                  Our work spans regulated fintech on five delivery surfaces, healthcare
                  placement platforms handling sensitive clinical context, and
                  professional-services firms whose credibility has to be legible in
                  eight seconds of search traffic. Different industries, one standard.
                </p>
                <p className="text-white">
                  We take a product from first frame to store approval, from search
                  architecture to the weekly report that says what moved — and we stay
                  after launch.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] sm:grid-cols-4">
                {[
                  ["7+", "Products shipped"],
                  ["2", "App stores approved"],
                  ["8", "Venue integrations"],
                  ["24/7", "Systems running"],
                ].map(([v, l]) => (
                  <div key={l} className="bg-[#070810]/80 px-4 py-5 backdrop-blur-xl">
                    <dd className="display text-[1.6rem] text-white">{v}</dd>
                    <dt className="mt-1 text-[0.75rem] leading-snug text-titanium-dim">{l}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="space-y-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.07} amount={0.25}>
                <article className="glass glass-edge group rounded-2xl p-6 transition-colors duration-500 hover:border-white/18">
                  <div className="flex items-start gap-4">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#58e6ff] to-[#9b7bff]" />
                    <div>
                      <h3 className="text-[1.0625rem] font-medium tracking-[-0.02em] text-white">
                        {p.t}
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-titanium">{p.d}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}

            <Reveal delay={0.28} amount={0.2}>
              <div className="glass glass-edge mt-3 rounded-2xl p-6">
                <p className="eyebrow">Structure</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="text-[1.0625rem] font-medium tracking-[-0.02em] text-white">
                      Bytes and Partners
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-titanium-dim">
                      Parent technology company
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 bg-gradient-to-r from-[#4d8dff]/50 to-[#9b7bff]/30 sm:block"
                  />
                  <span aria-hidden className="text-titanium-dim sm:hidden">
                    ↓
                  </span>
                  <div className="min-w-0 sm:text-right">
                    <p className="text-[1.0625rem] font-medium tracking-[-0.02em] text-gradient-ai">
                      BytesPlatform
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-titanium-dim">
                      Technology platform &amp; subsidiary
                    </p>
                  </div>
                </div>
                <p className="mt-5 border-t border-white/8 pt-4 text-[0.875rem] leading-relaxed text-titanium">
                  Client products are built by Bytes and Partners through BytesPlatform —
                  our technology platform for AI systems, applications and custom
                  software.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.34} amount={0.2}>
              <div className="glass-edge relative mt-3 overflow-hidden rounded-2xl">
                <Image
                  src="/projects/quantiva/screen-wall.jpg"
                  alt="A wall of production screens from a shipped Bytes and Partners build"
                  width={2400}
                  height={119}
                  sizes="(max-width: 1024px) 92vw, 600px"
                  className="h-[86px] w-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#05060a,transparent_22%,transparent_78%,#05060a),linear-gradient(180deg,rgba(5,6,10,0.35),rgba(5,6,10,0.75))]" />
                <p className="absolute inset-0 grid place-items-center font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/80">
                  66 production screens · one release
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
