import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-col justify-between px-[var(--bp-gut)] py-[var(--bp-gut)]">
      <span className="hero-mark text-ink">
        Bytes &amp; Partners
      </span>

      <div>
        <p className="hero-meta mb-5">Error 404</p>
        <h1 className="hero-word !opacity-100" style={{ fontSize: "clamp(2.5rem,8vw,7rem)" }}>
          Not found<span className="hero-period">.</span>
        </h1>
        <Link href="/" className="hero-pill mt-9 inline-flex">
          <span className="hero-dot" aria-hidden />
          Back to the studio
        </Link>
      </div>

      <span className="hero-meta">New York</span>
    </section>
  );
}
