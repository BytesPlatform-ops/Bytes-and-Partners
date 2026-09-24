import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const DESCRIPTION =
  "Read the Bytes & Partners refund, cancellation, milestone payment, subscription, and digital service terms.";

export const metadata: Metadata = {
  title: { absolute: "Refund Policy | Bytes & Partners" },
  description: DESCRIPTION,
  alternates: { canonical: "/refund-policy" },
  openGraph: {
    title: "Refund Policy | Bytes & Partners",
    description: DESCRIPTION,
    url: "/refund-policy",
  },
};

const REFUND_EMAIL = "info@bytesandpartners.co";

type Section = { title: string; body: ReactNode };

const SECTIONS: Section[] = [
  {
    title: "Contract-Specific Terms",
    body: (
      <>
        <p>
          Refunds, returns, and cancellations are primarily governed by the individual
          agreements or contracts signed with each client. Any request for refunds must
          follow the conditions outlined in your specific service contract.
        </p>
        <p>
          Bytes and Partners reserves the right to deny refunds where contractual terms are
          not met, or where substantial progress or delivery has been made.
        </p>
      </>
    ),
  },
  {
    title: "Milestone-Based Payments",
    body: (
      <>
        <p>We follow a milestone-based billing system across our service offerings.</p>
        <p>
          Milestone payments are strictly non-refundable once a milestone has been crossed
          and approved, either through direct approval or by proceeding to the next phase of
          work.
        </p>
      </>
    ),
  },
  {
    title: "Initial Payments & SEO Services",
    body: (
      <ul>
        <li>
          Initial milestone payments are non-refundable, as they cover discovery, planning,
          and resource allocation.
        </li>
        <li>
          For SEO services, the 50% advance for the first month is non-refundable once the
          work has commenced.
        </li>
        <li>
          The remaining 50% is due upon completion of the month&rsquo;s deliverables, and
          becomes non-refundable once delivered.
        </li>
      </ul>
    ),
  },
  {
    title: "App Development Projects",
    body: (
      <>
        <p>Refunds will not be issued for app development projects once:</p>
        <ul>
          <li>The design phase is approved and development has begun.</li>
          <li>
            The client fails to provide app store credentials, assets, or required content.
          </li>
          <li>The codebase or builds have been shared for review or deployment.</li>
        </ul>
      </>
    ),
  },
  {
    title: "ByteBot & ByteSuite Subscriptions",
    body: (
      <>
        <p>ByteBot and ByteSuite are subscription-based services.</p>
        <ul>
          <li>You may cancel your subscription anytime, effective from the next billing cycle.</li>
          <li>
            No refunds are issued for the current billing period once payment has been
            processed.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Non-Refundable Scenarios",
    body: (
      <>
        <p>Refunds will not be provided in the following cases:</p>
        <ul>
          <li>
            Delays caused by the client (e.g., missing feedback, logins, content, or
            prolonged unresponsiveness beyond 14 business days).
          </li>
          <li>
            Requests for project cancellation due to change of mind, internal disagreements,
            or business redirection.
          </li>
          <li>Revision requests beyond the original creative brief or scope of work.</li>
          <li>
            Any deliverables (e.g., websites, apps, logos) that have been approved or final
            files shared.
          </li>
          <li>
            Services such as Social Media Management, Domain Registration, Hosting,
            Trademark, SEO (after initiation), and use of third-party tools.
          </li>
          <li>
            If work has been shared with or reassigned to another agency or service provider
            during execution.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Refund Request Procedure",
    body: (
      <p>
        To initiate a refund request, email us at{" "}
        <a href={`mailto:${REFUND_EMAIL}`}>{REFUND_EMAIL}</a> with project details and your
        reason for the request. We may request supporting documentation. A detailed review
        will be completed within 15 business days.
      </p>
    ),
  },
  {
    title: "Ownership Clause",
    body: (
      <p>
        If a refund is approved or a dispute is filed, all intellectual property created
        (designs, code, content, strategy) remains the exclusive property of Bytes and
        Partners and may not be used by the client in any form.
      </p>
    ),
  },
];

export default function RefundPolicy() {
  return (
    <article className="relative">
      {/* ---------- intro ---------- */}
      <header className="relative isolate overflow-hidden px-5 pt-36 pb-14 sm:px-8 sm:pt-44 sm:pb-16 lg:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-20%] -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-50 blur-[130px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(77,141,255,0.28), rgba(155,123,255,0.14) 46%, transparent 72%)",
          }}
        />
        <div className="mx-auto max-w-[760px]">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-[#4d8dff] to-transparent" />
            <span className="eyebrow">Legal</span>
          </div>
          <h1 className="display mt-5 text-[clamp(2.5rem,6vw,4.5rem)] text-gradient">
            Refund Policy
          </h1>
          <p className="mt-5 text-[1.125rem] leading-relaxed text-chalk/90">
            Understand our return and refund terms for all services.
          </p>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-titanium">
            Bytes and Partners is committed to delivering high-quality digital services
            through structured processes and transparent agreements. This refund and return
            policy outlines the conditions under which refunds or cancellations may be
            considered.
          </p>
        </div>
      </header>

      {/* ---------- sections ---------- */}
      <div className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12">
        <div className="mx-auto max-w-[760px]">
          <ol className="border-t border-white/8">
            {SECTIONS.map((s, i) => {
              const n = String(i + 1).padStart(2, "0");
              const id = `section-${i + 1}`;
              return (
                <li
                  key={s.title}
                  className="grid gap-3 border-b border-white/8 py-9 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6 sm:py-11"
                >
                  <span className="font-mono text-[0.8125rem] leading-[1.9rem] text-electric" aria-hidden>
                    {n}
                  </span>
                  <section aria-labelledby={id}>
                    <h2
                      id={id}
                      className="text-[1.375rem] font-medium leading-snug tracking-[-0.02em] text-white sm:text-[1.5rem]"
                    >
                      <span className="sr-only">{i + 1}. </span>
                      {s.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-[1rem] leading-[1.75] text-titanium [&_a]:text-chalk [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:hover:decoration-electric [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.8em] [&_li]:before:h-px [&_li]:before:w-2.5 [&_li]:before:bg-electric/70 [&_ul]:space-y-2.5">
                      {s.body}
                    </div>
                  </section>
                </li>
              );
            })}
          </ol>

          <aside className="glass-soft mt-12 rounded-2xl px-6 py-5 sm:px-7">
            <p className="text-[0.9375rem] leading-relaxed text-titanium">
              <span className="font-medium text-chalk">Note:</span> This policy is a binding
              extension of our official Service Agreement and is enforceable under applicable
              law.
            </p>
          </aside>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="rounded-full bg-white px-6 py-3 text-[0.9375rem] font-medium text-[#06070b] transition-transform duration-400 hover:scale-[1.03]"
            >
              Contact us
            </Link>
            <Link
              href="/"
              className="glass glass-edge rounded-full px-6 py-3 text-[0.9375rem] text-white transition-colors hover:border-white/25"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
