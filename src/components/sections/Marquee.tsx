const ITEMS = [
  "AI Agents",
  "Automation",
  "Web Applications",
  "iOS & Android",
  "CRM Platforms",
  "SaaS Products",
  "RAG Systems",
  "Design Systems",
  "Payments & Billing",
  "KYC & Compliance",
  "Digital Transformation",
  "Custom Software",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="Capabilities" className="relative border-y border-white/7 py-5">
      <div className="mask-fade-x flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {row.map((item, i) => (
            <span key={item + i} className="flex shrink-0 items-center gap-10">
              <span className="whitespace-nowrap font-mono text-[0.75rem] uppercase tracking-[0.2em] text-titanium-dim">
                {item}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#4d8dff]/50" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
