export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
          <defs>
            <linearGradient id="bp-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#58e6ff" />
              <stop offset="52%" stopColor="#4d8dff" />
              <stop offset="100%" stopColor="#9b7bff" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="30" height="30" rx="9" fill="rgba(255,255,255,0.06)" />
          <rect x="1" y="1" width="30" height="30" rx="9" stroke="rgba(255,255,255,0.14)" fill="none" />
          <path
            d="M11 9.5h6.4c2.5 0 4.1 1.3 4.1 3.4 0 1.5-.8 2.5-2.1 2.9 1.6.4 2.6 1.6 2.6 3.3 0 2.4-1.8 3.9-4.7 3.9H11V9.5Zm3.1 5.4h2.6c1.1 0 1.8-.5 1.8-1.4s-.7-1.4-1.8-1.4h-2.6v2.8Zm0 5.6h3c1.2 0 1.9-.6 1.9-1.5 0-1-.7-1.5-1.9-1.5h-3v3Z"
            fill="url(#bp-g)"
          />
        </svg>
      </span>
      <span className="text-[0.9375rem] font-medium tracking-[-0.02em] text-white">
        Bytes<span className="text-titanium"> and Partners</span>
      </span>
    </span>
  );
}
