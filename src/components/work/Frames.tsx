"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function DeviceFrame({
  src,
  alt,
  priority,
  className,
  width,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  width?: number;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[2.1rem] p-[3px] shadow-lift",
        width ? "shrink-0" : "w-full",
        "bg-[linear-gradient(160deg,rgba(255,255,255,0.30),rgba(255,255,255,0.05)_38%,rgba(255,255,255,0.02)_62%,rgba(255,255,255,0.16))]",
        className
      )}
      style={width ? { width } : undefined}
    >
      <div className="relative overflow-hidden rounded-[1.95rem] bg-[#0a0b10]">
        <Image
          src={src}
          alt={alt}
          width={700}
          height={1517}
          sizes="(max-width: 768px) 60vw, 300px"
          priority={priority}
          className="h-auto w-full select-none"
          draggable={false}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-2 h-[18px] w-[86px] -translate-x-1/2 rounded-full bg-black/85"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.95rem]"
          style={{
            background:
              "linear-gradient(118deg, rgba(255,255,255,0.10) 0%, transparent 32%, transparent 68%, rgba(255,255,255,0.05) 100%)",
          }}
        />
      </div>
    </div>
  );
}

export function BrowserFrame({
  src,
  alt,
  url,
  priority,
  className,
  width,
  caption,
}: {
  src: string;
  alt: string;
  url?: string;
  priority?: boolean;
  className?: string;
  width?: number;
  caption?: string;
}) {
  return (
    <figure
      className={cn("relative", width ? "shrink-0" : "w-full", className)}
      style={width ? { width } : undefined}
    >
      <div className="glass glass-edge overflow-hidden rounded-2xl shadow-lift">
        <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-3.5 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-white/18" />
            <span className="h-2 w-2 rounded-full bg-white/12" />
            <span className="h-2 w-2 rounded-full bg-white/9" />
          </span>
          {url && (
            <span className="ml-1.5 truncate rounded-md bg-white/[0.05] px-2.5 py-1 font-mono text-[0.625rem] text-titanium-dim">
              {url}
            </span>
          )}
        </div>
        <div className="relative bg-[#0a0b10]">
          <Image
            src={src}
            alt={alt}
            width={1500}
            height={938}
            sizes="(max-width: 768px) 88vw, 780px"
            priority={priority}
            className="h-auto w-full select-none"
            draggable={false}
          />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-[0.6875rem] tracking-[0.02em] text-titanium-dim">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function ScrollingSite({
  src,
  alt,
  url,
  width = 420,
  duration = 22,
}: {
  src: string;
  alt: string;
  url?: string;
  width?: number;
  duration?: number;
}) {
  return (
    <div className="group relative shrink-0" style={{ width }}>
      <div className="glass glass-edge overflow-hidden rounded-2xl shadow-lift">
        <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-3.5 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-white/18" />
            <span className="h-2 w-2 rounded-full bg-white/12" />
            <span className="h-2 w-2 rounded-full bg-white/9" />
          </span>
          {url && (
            <span className="ml-1.5 truncate rounded-md bg-white/[0.05] px-2.5 py-1 font-mono text-[0.625rem] text-titanium-dim">
              {url}
            </span>
          )}
        </div>
        <div
          className="relative overflow-hidden bg-[#0a0b10]"
          style={{ height: Math.round(width * 1.35) }}
        >
          <div
            className="absolute inset-x-0 top-0 transition-transform ease-linear group-hover:[transform:translateY(calc(-100%+var(--vh)))]"
            style={
              {
                transitionDuration: `${duration}s`,
                "--vh": `${Math.round(width * 1.35)}px`,
              } as React.CSSProperties
            }
          >
            <Image
              src={src}
              alt={alt}
              width={760}
              height={2400}
              sizes="(max-width: 768px) 80vw, 420px"
              className="h-auto w-full select-none"
              draggable={false}
            />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 72%, rgba(5,6,10,0.55) 100%)",
            }}
          />
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 font-mono text-[0.6875rem] text-titanium-dim">
        <span className="h-1 w-1 rounded-full bg-[#4d8dff]" />
        Hover to scroll the full page
      </p>
    </div>
  );
}
