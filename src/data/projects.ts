export type Shot = { src: string; caption: string };

export type Project = {
  slug: string;
  name: string;
  discipline: string[];
  summary: string;
  solution: string;
  caseTheme: { accent: string; bg: string; fg: string };
  media: "device" | "browser";
  shots: Shot[];
  extra?: Shot[];
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    slug: "quantiva-hq",
    name: "Quantiva HQ",
    discipline: ["Product Strategy", "UI/UX", "iOS & Android", "Web App", "Integrations", "Compliance"],
    summary:
      "A non-custodial, AI-assisted trading platform linking a trader's own exchange and brokerage accounts, scoring every signal, and executing the order on the screen it appeared on.",
    solution:
      "One shell with a Crypto/Stocks segmented control that swaps the entire data model while navigation and component grammar stay identical. Every news card, watchlist row and trade idea carries a Trade action that raises the order ticket in place. KYC, per-user risk controls, pooled VC Pools, an on-chain rewards ledger and four-tier entitlement billing all shipped live in v1.0.",
    caseTheme: { accent: "#ff8a1f", bg: "#171411", fg: "#fff0de" },
    media: "device",
    shots: [
      { src: "/projects/quantiva/app-01.jpg", caption: "Crypto dashboard · live action feed" },
      { src: "/projects/quantiva/app-02.jpg", caption: "Execute trade · in-place ticket" },
      { src: "/projects/quantiva/app-03.jpg", caption: "No-code strategy builder" },
      { src: "/projects/quantiva/app-04.jpg", caption: "Market coins · add to portfolio" },
      { src: "/projects/quantiva/app-05.jpg", caption: "Order ticket · limit / market / stop" },
      { src: "/projects/quantiva/app-06.jpg", caption: "VC Pools · community capital" },
      { src: "/projects/quantiva/app-07.jpg", caption: "Pool detail · published NAV" },
      { src: "/projects/quantiva/app-08.jpg", caption: "Trading settings · user-owned risk" },
      { src: "/projects/quantiva/app-09.jpg", caption: "Account security · live sessions" },
      { src: "/projects/quantiva/app-12.jpg", caption: "Dual-market integrations" },
      { src: "/projects/quantiva/app-13.jpg", caption: "Identity verification · SumSub" },
      { src: "/projects/quantiva/app-14.jpg", caption: "Stocks dashboard · same shell" },
    ],
    extra: [
      { src: "/projects/quantiva/web-crypto-01.jpg", caption: "Web · crypto dashboard" },
      { src: "/projects/quantiva/web-crypto-03.jpg", caption: "Web · top trades, scored signals" },
      { src: "/projects/quantiva/web-crypto-04.jpg", caption: "Web · AI insights feed" },
      { src: "/projects/quantiva/web-stocks-01.jpg", caption: "Web · stocks mode" },
      { src: "/projects/quantiva/web-crypto-08.jpg", caption: "Web · QHQ token wallet" },
      { src: "/projects/quantiva/web-stocks-02.jpg", caption: "Web · market overview" },
    ],
    link: { label: "quantivahq.com", href: "https://www.quantivahq.com/" },
  },
  {
    slug: "nonnis-placement",
    name: "Nonni's Placement",
    discipline: ["Product Design", "Web Platform", "Admin Panel", "Payments"],
    summary:
      "A placement platform for Washington State families, hospitals and providers — where clinical context, funding and urgency resolve into a shortlist of real communities instead of a phone tree.",
    solution:
      "A structured intake that captures the full clinical picture — care level, behavioral and memory needs, funding, urgency, distance — and organises listings against it, while keeping an RN in the decision. Providers list and maintain their own communities; an admin console governs listings, referrals and the review queue end to end.",
    caseTheme: { accent: "#ff8a1f", bg: "#171411", fg: "#fff0de" },
    media: "browser",
    shots: [
      { src: "/projects/nonnis/shot-01.jpg", caption: "Hero · real care, matched to real needs" },
      { src: "/projects/nonnis/shot-02.jpg", caption: "Live community listings" },
      { src: "/projects/nonnis/shot-03.jpg", caption: "Intake · clinical context capture" },
      { src: "/projects/nonnis/shot-04.jpg", caption: "RN-led review, explained" },
      { src: "/projects/nonnis/shot-05.jpg", caption: "Care you can see, not just read about" },
      { src: "/projects/nonnis/shot-06.jpg", caption: "Placement CTA · families & providers" },
    ],
  },
  {
    slug: "benavente-group",
    name: "The Benavente Group",
    discipline: ["Web Design", "Development", "SEO Architecture", "Content Engine"],
    summary:
      "A five-page platform and content engine for a Honolulu commercial appraisal firm — each page carrying one burden of proof, and a knowledge system that ranks for the technical vocabulary its buyers search.",
    solution:
      "Architecture that assigns one buyer question to each page — can they do this work, are they credible, have they done it before, do they understand my problem, how do I reach them discreetly — plus a definition-led content engine pairing a valuation term with a named professional audience and the Hawai'i jurisdiction.",
    caseTheme: { accent: "#ba925b", bg: "#f6f0df", fg: "#121d30" },
    media: "browser",
    shots: [
      { src: "/projects/benavente/shot-01.jpg", caption: "Homepage hero · credentials first" },
      { src: "/projects/benavente/shot-02.jpg", caption: "Authority block · countable proof" },
      { src: "/projects/benavente/shot-03.jpg", caption: "Statistics band" },
      { src: "/projects/benavente/shot-04.jpg", caption: "Selected projects · real assignments" },
      { src: "/projects/benavente/shot-05.jpg", caption: "Coverage · named jurisdictions" },
      { src: "/projects/benavente/shot-06.jpg", caption: "Insights · the content engine" },
    ],
    extra: [
      { src: "/projects/benavente/page-01-01.jpg", caption: "About · the firm's case for itself" },
      { src: "/projects/benavente/page-02-01.jpg", caption: "Portfolio · eleven filterable categories" },
      { src: "/projects/benavente/page-03-01.jpg", caption: "Contact · discreet conversion path" },
    ],
    link: { label: "benaventegroup.com", href: "https://www.benaventegroup.com/" },
  },
  {
    slug: "angels-of-cascades",
    name: "Angels of Cascades",
    discipline: ["Brand Direction", "Web Design", "Development", "Motion"],
    summary:
      "An adult family home experience built around reassurance — where the first thing a worried family meets is warmth, and the admission path is five clear steps rather than a form.",
    solution:
      "A narrative structure that opens on a resident's journey — from uncertainty to comfort — then answers the practical questions in order: what care is provided, who it is for, which payers are welcome, and what the five admission steps actually are. Soft violet, editorial typography, and real moments instead of stock reassurance.",
    caseTheme: { accent: "#9568e8", bg: "#f2edf9", fg: "#30243e" },
    media: "browser",
    shots: [
      { src: "/projects/angels-of-cascades/shot-01.jpg", caption: "Hero · compassionate care" },
      { src: "/projects/angels-of-cascades/shot-02.jpg", caption: "A resident's journey" },
      { src: "/projects/angels-of-cascades/shot-03.jpg", caption: "24-hour personalized care" },
      { src: "/projects/angels-of-cascades/shot-04.jpg", caption: "Inside a calmer kind of care" },
      { src: "/projects/angels-of-cascades/shot-05.jpg", caption: "Admissions · payer types" },
      { src: "/projects/angels-of-cascades/shot-06.jpg", caption: "Built for referral partners" },
      { src: "/projects/angels-of-cascades/shot-07.jpg", caption: "Closing invitation" },
    ],
  },
  {
    slug: "aegis-creek",
    name: "Aegis Creek",
    discipline: ["Web Design", "Development", "LinkedIn Paid Media", "Content"],
    summary:
      "A Silicon Valley advisory helping deep-tech companies raise SBIR, STTR and federal funding — given a site that reads like the technical partner it is, plus an always-on LinkedIn acquisition program.",
    solution:
      "A dark, engineering-grade brand site that leads with the outcome — raising government funds for AI, cleantech and semiconductors — and separates core services from sector focus so a founder can self-qualify immediately. Underneath it, a LinkedIn paid program built around audience-matched creative, a structured campaign calendar and a booking-first conversion path.",
    caseTheme: { accent: "#22d3ee", bg: "#0d2026", fg: "#e5f5f5" },
    media: "browser",
    shots: [
      { src: "/projects/aegis-creek/shot-01.jpg", caption: "Hero · raising government funds" },
      { src: "/projects/aegis-creek/shot-02.jpg", caption: "Strategic expertise · non-dilutive capital" },
      { src: "/projects/aegis-creek/shot-03.jpg", caption: "Core services & sector focus" },
      { src: "/projects/aegis-creek/shot-04.jpg", caption: "Contact · booking-first path" },
    ],
    link: { label: "aegiscreek.com", href: "https://aegiscreek.com" },
  },
  {
    slug: "intellimaint-ai",
    name: "IntelliMaint AI",
    discipline: ["Product Design", "Web App", "AI/RAG", "Auth & Onboarding"],
    summary:
      "An AI virtual mechanic for military and civilian maintenance teams — upload a manual, search a vast repository, and get guided repair instructions with vision analysis and voice agents.",
    solution:
      "Document intelligence that chunks, embeds and indexes uploaded manuals for retrieval, layered over a 60,000+ manual library with LLM fallback when the corpus comes up short. A photo of a faulty component returns diagnostic context; a voice agent handles hands-busy work. Account types separate civilian, military and student access at signup.",
    caseTheme: { accent: "#2558e3", bg: "#0d121c", fg: "#eef4ff" },
    media: "browser",
    shots: [
      { src: "/projects/intellimaint/shot-01.jpg", caption: "Hero · troubleshooting assistant" },
      { src: "/projects/intellimaint/shot-02.jpg", caption: "Core capabilities" },
      { src: "/projects/intellimaint/shot-03.jpg", caption: "How it works · three steps" },
      { src: "/projects/intellimaint/shot-04.jpg", caption: "Trusted by users" },
      { src: "/projects/intellimaint/shot-05.jpg", caption: "Pricing & access tiers" },
      { src: "/projects/intellimaint/shot-06.jpg", caption: "Product detail" },
    ],
    extra: [
      { src: "/projects/intellimaint/page-01-01.jpg", caption: "How it works" },
      { src: "/projects/intellimaint/page-02-01.jpg", caption: "Account creation" },
      { src: "/projects/intellimaint/page-03-01.jpg", caption: "FAQ" },
    ],
  },
  {
    slug: "team-smith-logistics",
    name: "Team Smith Logistics",
    discipline: ["Web Design", "Development", "Content", "Local SEO"],
    summary:
      "A Southern California transport and recovery operator — mobile EV charging, luxury vehicle transport, heavy recovery — given a site that names every service instead of hiding them behind 'logistics'.",
    solution:
      "A service-led architecture where each capability gets its own named block, its own explanation and its own entry point — backed by a real gallery, an FAQ that answers dispatch questions, and service-area copy naming LA, Riverside and San Bernardino explicitly.",
    caseTheme: { accent: "#2788bd", bg: "#eaf1f5", fg: "#162c40" },
    media: "browser",
    shots: [
      { src: "/projects/team-smith/shot-01.jpg", caption: "Hero · mobile EV charging" },
      { src: "/projects/team-smith/shot-02.jpg", caption: "About & areas served" },
      { src: "/projects/team-smith/shot-03.jpg", caption: "Service lines" },
      { src: "/projects/team-smith/shot-04.jpg", caption: "Specialist capabilities" },
      { src: "/projects/team-smith/shot-05.jpg", caption: "Proof · real fleet" },
      { src: "/projects/team-smith/shot-06.jpg", caption: "Contact & dispatch" },
    ],
    extra: [
      { src: "/projects/team-smith/page-01-01.jpg", caption: "About us" },
      { src: "/projects/team-smith/page-02-01.jpg", caption: "Gallery" },
      { src: "/projects/team-smith/page-03-01.jpg", caption: "Contact" },
    ],
  },
];
