import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative isolate grid min-h-[70svh] place-items-center overflow-hidden px-6 py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-50 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(77,141,255,0.28), rgba(155,123,255,0.14) 46%, transparent 72%)",
        }}
      />
      <div className="text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-5 text-[clamp(2.5rem,7vw,5rem)] text-gradient">
          This page moved on.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[1.0625rem] leading-relaxed text-titanium">
          The address you followed does not exist. The work, however, very much does.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-white px-6 py-3 text-[0.9375rem] font-medium text-[#06070b] transition-transform duration-400 hover:scale-[1.03]"
          >
            Back to home
          </Link>
          <Link
            href="/#work"
            className="glass glass-edge rounded-full px-6 py-3 text-[0.9375rem] text-white transition-colors hover:border-white/25"
          >
            See selected work
          </Link>
        </div>
      </div>
    </section>
  );
}
