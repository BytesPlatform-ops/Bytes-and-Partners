export type Metric = { value: string; label: string };
export type Shot = { src: string; caption: string };

export type Project = {
  slug: string;
  name: string;
  client: string;
  category: string;
  discipline: string[];
  year: string;
  surfaces: string;
  headline: string;
  summary: string;
  problem: string;
  solution: string;
  outcome: string[];
  tech: string[];
  metrics: Metric[];
  accent: { from: string; to: string; glow: string };
  media: "device" | "browser";
  shots: Shot[];
  full?: string;
  extra?: Shot[];
  link?: { label: string; href: string };
  note?: string;
};

export const projects: Project[] = [
  {
    slug: "quantiva-hq",
    name: "Quantiva HQ",
    client: "Quantiva Nexus LLC",
    category: "AI Trading Platform",
    discipline: ["Product Strategy", "UI/UX", "iOS & Android", "Web App", "Integrations", "Compliance"],
    year: "2026",
    surfaces: "iOS · Android · macOS · visionOS · Web",
    headline: "A dual-market trading terminal that treats crypto and equities as one portfolio.",
    summary:
      "A non-custodial, AI-assisted trading platform linking a trader's own exchange and brokerage accounts, scoring every signal, and executing the order on the screen it appeared on.",
    problem:
      "Traders holding both crypto and equities run two apps, two logins and two mental models — reconciling portfolio value by hand and re-finding a signal in a different app before they can act on it.",
    solution:
      "One shell with a Crypto/Stocks segmented control that swaps the entire data model while navigation and component grammar stay identical. Every news card, watchlist row and trade idea carries a Trade action that raises the order ticket in place. KYC, per-user risk controls, pooled VC Pools, an on-chain rewards ledger and four-tier entitlement billing all shipped live in v1.0.",
    outcome: [
      "Approved in the regulated 18+ finance category on both app stores at first submission, with the SumSub identity pipeline live from v1.0 rather than retrofitted.",
      "Seven execution venues plus market-data feeds resolve into a single portfolio view without the platform ever taking custody.",
      "Nine in-app subscription SKUs across three tiers, enforced per feature at the surface level — not just on a pricing page.",
    ],
    tech: [
      "iOS 15.6+",
      "Android",
      "macOS (Apple silicon)",
      "visionOS",
      "SumSub KYC/AML",
      "Binance · Bybit · KuCoin · Bitget",
      "Interactive Brokers · Alpaca · Robinhood",
      "StockNewsAPI",
      "Base chain · Merkle proofs",
      "Apple IAP · Play Billing",
    ],
    metrics: [
      { value: "66", label: "Screens across 39 flows" },
      { value: "8", label: "Market connectivity sources" },
      { value: "5", label: "Delivery surfaces" },
      { value: "4", label: "Entitlement tiers enforced" },
    ],
    accent: { from: "#ff8a1f", to: "#ff5722", glow: "rgba(255,138,31,0.30)" },
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
    client: "Nonni's Placement Services",
    category: "Care Matching Platform",
    discipline: ["Product Design", "Web Platform", "Admin Panel", "Payments"],
    year: "2026",
    surfaces: "Web platform · Admin console",
    headline: "RN-reviewed senior care placement, turned into a matching engine families can actually use.",
    summary:
      "A placement platform for Washington State families, hospitals and providers — where clinical context, funding and urgency resolve into a shortlist of real communities instead of a phone tree.",
    problem:
      "Families discharging a loved one have days, not weeks. Placement decisions were run over calls and spreadsheets, with no shared view of care level, payer type, specialty capability or which communities actually had an opening.",
    solution:
      "A structured intake that captures the full clinical picture — care level, behavioral and memory needs, funding, urgency, distance — and organises listings against it, while keeping an RN in the decision. Providers list and maintain their own communities; an admin console governs listings, referrals and the review queue end to end.",
    outcome: [
      "One intake replaces the call-and-spreadsheet loop for families, hospital discharge planners and providers alike.",
      "Provider-side listing management plus an admin review queue keeps every referral RN-reviewed before it reaches a family.",
      "Secure, HIPAA-conscious data handling stated in the flow itself, at the moment information is requested.",
    ],
    tech: ["Next.js", "React", "Design system", "Role-based admin", "Stripe", "Responsive web"],
    metrics: [
      { value: "39", label: "WA counties served" },
      { value: "12", label: "Facility & care types" },
      { value: "$0", label: "Cost to families" },
      { value: "100%", label: "Referrals RN-reviewed" },
    ],
    accent: { from: "#d99a4e", to: "#8a5a2b", glow: "rgba(217,154,78,0.26)" },
    media: "browser",
    shots: [
      { src: "/projects/nonnis/shot-01.jpg", caption: "Hero · real care, matched to real needs" },
      { src: "/projects/nonnis/shot-02.jpg", caption: "Live community listings" },
      { src: "/projects/nonnis/shot-03.jpg", caption: "Intake · clinical context capture" },
      { src: "/projects/nonnis/shot-04.jpg", caption: "RN-led review, explained" },
      { src: "/projects/nonnis/shot-05.jpg", caption: "Care you can see, not just read about" },
      { src: "/projects/nonnis/shot-06.jpg", caption: "Placement CTA · families & providers" },
    ],
    full: "/projects/nonnis/full.jpg",
    note: "Figures as published on the client site.",
  },
  {
    slug: "benavente-group",
    name: "The Benavente Group",
    client: "The Benavente Group LLC",
    category: "Authority Platform & SEO",
    discipline: ["Web Design", "Development", "SEO Architecture", "Content Engine"],
    year: "2026",
    surfaces: "Web · Content · Search",
    headline: "Pacific valuation expertise, turned into a search-driven authority platform.",
    summary:
      "A five-page platform and content engine for a Honolulu commercial appraisal firm — each page carrying one burden of proof, and a knowledge system that ranks for the technical vocabulary its buyers search.",
    problem:
      "A highly credentialed MAI/SRA practice whose expertise lived entirely in referrals. Attorneys and lenders searching terms like external obsolescence or percentage rent had no way to discover the firm that could answer them.",
    solution:
      "Architecture that assigns one buyer question to each page — can they do this work, are they credible, have they done it before, do they understand my problem, how do I reach them discreetly — plus a definition-led content engine pairing a valuation term with a named professional audience and the Hawai'i jurisdiction.",
    outcome: [
      "Nine of fourteen ranking queries are informational valuation terms — the authority-through-teaching thesis, confirmed in the data.",
      "Five of the ten highest-click pages are blog guides: content became a primary acquisition channel, not a supporting one.",
      "Indexed coverage grew 54 → 61 pages while exclusions fell 13 → 11, at a 100 ms average server response.",
    ],
    tech: ["Web design", "Front-end build", "Technical SEO", "Content architecture", "Search Console reporting"],
    metrics: [
      { value: "9.92K", label: "Search impressions" },
      { value: "10.9", label: "Average position" },
      { value: "9/14", label: "Rankings informational" },
      { value: "100ms", label: "Avg. response time" },
    ],
    accent: { from: "#c9a24a", to: "#1b2a4a", glow: "rgba(201,162,74,0.24)" },
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
    full: "/projects/benavente/full.jpg",
    link: { label: "benaventegroup.com", href: "https://www.benaventegroup.com/" },
    note: "Search figures read from the client's Google Search Console for the 60+ day window ending 10 Sep 2026.",
  },
  {
    slug: "angels-of-cascades",
    name: "Angels of Cascades",
    client: "Angels of Cascades AFH LLC",
    category: "Healthcare Experience",
    discipline: ["Brand Direction", "Web Design", "Development", "Motion"],
    year: "2026",
    surfaces: "Web",
    headline: "A calmer kind of care, communicated before a family ever picks up the phone.",
    summary:
      "An adult family home experience built around reassurance — where the first thing a worried family meets is warmth, and the admission path is five clear steps rather than a form.",
    problem:
      "Families choosing an adult family home are making a high-stress decision under time pressure. Most sites in the category lead with facilities and payer logistics, which reads as clinical exactly when it needs to read as human.",
    solution:
      "A narrative structure that opens on a resident's journey — from uncertainty to comfort — then answers the practical questions in order: what care is provided, who it is for, which payers are welcome, and what the five admission steps actually are. Soft violet, editorial typography, and real moments instead of stock reassurance.",
    outcome: [
      "Care, payer types and admission steps are legible in a single scroll, without a family needing to call to qualify.",
      "Referral paths for hospitals, case managers and discharge planners sit alongside the family path rather than buried under it.",
      "An FAQ layer absorbs the questions that previously arrived as first-contact phone calls.",
    ],
    tech: ["Next.js", "React", "Motion design", "Responsive web", "SEO foundations"],
    metrics: [
      { value: "24/7", label: "Care model communicated" },
      { value: "5", label: "Admission steps mapped" },
      { value: "6", label: "Payer types surfaced" },
      { value: "1", label: "Scroll to full clarity" },
    ],
    accent: { from: "#a78bfa", to: "#6d28d9", glow: "rgba(167,139,250,0.28)" },
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
    full: "/projects/angels-of-cascades/full.jpg",
  },
  {
    slug: "aegis-creek",
    name: "Aegis Creek",
    client: "Aegis Creek",
    category: "Brand Site & Paid Acquisition",
    discipline: ["Web Design", "Development", "LinkedIn Paid Media", "Content"],
    year: "2026",
    surfaces: "Web · LinkedIn Ads",
    headline: "Positioning a government funding advisory for founders raising non-dilutive capital.",
    summary:
      "A Silicon Valley advisory helping deep-tech companies raise SBIR, STTR and federal funding — given a site that reads like the technical partner it is, plus an always-on LinkedIn acquisition program.",
    problem:
      "Deep-tech founders searching for non-dilutive capital are evaluating whether an advisor genuinely understands DoD, DARPA, NSF and DOE pathways. Generic consulting positioning fails that test in seconds.",
    solution:
      "A dark, engineering-grade brand site that leads with the outcome — raising government funds for AI, cleantech and semiconductors — and separates core services from sector focus so a founder can self-qualify immediately. Underneath it, a LinkedIn paid program built around audience-matched creative, a structured campaign calendar and a booking-first conversion path.",
    outcome: [
      "One page communicates both the funding programs covered and the sectors served, without a discovery call.",
      "A free-assessment and Calendly path turns interest into a scheduled technical conversation rather than a contact form.",
      "Paid social runs as a managed, ongoing program — creative, targeting and calendar maintained week over week.",
    ],
    tech: ["Web design", "Front-end build", "LinkedIn Ads", "Campaign strategy", "Creative production", "Calendly"],
    metrics: [
      { value: "SBIR", label: "STTR & federal programs" },
      { value: "4", label: "Agency pathways positioned" },
      { value: "3", label: "Markets: AI, cleantech, semi" },
      { value: "24/7", label: "Always-on paid program" },
    ],
    accent: { from: "#22d3ee", to: "#3b82f6", glow: "rgba(34,211,238,0.26)" },
    media: "browser",
    shots: [
      { src: "/projects/aegis-creek/shot-01.jpg", caption: "Hero · raising government funds" },
      { src: "/projects/aegis-creek/shot-02.jpg", caption: "Strategic expertise · non-dilutive capital" },
      { src: "/projects/aegis-creek/shot-03.jpg", caption: "Core services & sector focus" },
      { src: "/projects/aegis-creek/shot-04.jpg", caption: "Contact · booking-first path" },
    ],
    full: "/projects/aegis-creek/full.jpg",
    link: { label: "aegiscreek.com", href: "https://aegiscreek.com" },
  },
  {
    slug: "intellimaint-ai",
    name: "IntelliMaint AI",
    client: "IntelliMaint AI",
    category: "AI Virtual Mechanic",
    discipline: ["Product Design", "Web App", "AI/RAG", "Auth & Onboarding"],
    year: "2026",
    surfaces: "Web application",
    headline: "A troubleshooting assistant sitting on 60,000+ technical manuals.",
    summary:
      "An AI virtual mechanic for military and civilian maintenance teams — upload a manual, search a vast repository, and get guided repair instructions with vision analysis and voice agents.",
    problem:
      "Maintenance technicians lose hours inside PDF manuals. Classified and civilian documentation live in different places, and the answer a technician needs is three levels deep in a document nobody has time to read.",
    solution:
      "Document intelligence that chunks, embeds and indexes uploaded manuals for retrieval, layered over a 60,000+ manual library with LLM fallback when the corpus comes up short. A photo of a faulty component returns diagnostic context; a voice agent handles hands-busy work. Account types separate civilian, military and student access at signup.",
    outcome: [
      "Guided repair instructions in minutes from a three-step onboarding: create an account, build a knowledge base, ask.",
      "Secure upload path for classified documentation kept distinct from the public manual library.",
      "A complete auth surface — signup, representative access, verification and recovery — designed alongside the product, not after it.",
    ],
    tech: ["RAG pipeline", "Vector search", "LLM fallback", "Vision analysis", "Voice agents", "Auth & verification"],
    metrics: [
      { value: "60K+", label: "Manuals indexed" },
      { value: "3", label: "Account types supported" },
      { value: "Minutes", label: "From upload to answer" },
      { value: "Voice", label: "Hands-free assistance" },
    ],
    accent: { from: "#60a5fa", to: "#1d4ed8", glow: "rgba(96,165,250,0.26)" },
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
    full: "/projects/intellimaint/full.jpg",
  },
  {
    slug: "team-smith-logistics",
    name: "Team Smith Logistics",
    client: "Team Smith Logistics",
    category: "Logistics Website",
    discipline: ["Web Design", "Development", "Content", "Local SEO"],
    year: "2026",
    surfaces: "Web",
    headline: "Nine specialist transport services, made findable one service at a time.",
    summary:
      "A Southern California transport and recovery operator — mobile EV charging, luxury vehicle transport, heavy recovery — given a site that names every service instead of hiding them behind 'logistics'.",
    problem:
      "A dealership needs vehicle transport, a stranded EV driver needs mobile charging, a construction firm needs equipment hauling. Described as 'logistics services', every one of those buyers bounces.",
    solution:
      "A service-led architecture where each capability gets its own named block, its own explanation and its own entry point — backed by a real gallery, an FAQ that answers dispatch questions, and service-area copy naming LA, Riverside and San Bernardino explicitly.",
    outcome: [
      "Every specialist service is a discoverable entry point rather than a line in a paragraph.",
      "Service areas named by county and city, serving the geographic search signal directly.",
      "A 24/7 dispatch-first conversion path — call now, from any position on the page.",
    ],
    tech: ["Web design", "Front-end build", "Content structure", "Local SEO", "Responsive"],
    metrics: [
      { value: "9", label: "Named service lines" },
      { value: "24/7", label: "Dispatch availability" },
      { value: "3", label: "Counties covered" },
      { value: "6", label: "Pages, one job each" },
    ],
    accent: { from: "#38bdf8", to: "#1e3a8a", glow: "rgba(56,189,248,0.24)" },
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
    full: "/projects/team-smith/full.jpg",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
