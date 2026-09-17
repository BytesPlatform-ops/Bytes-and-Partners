"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
  strength?: number;
  target?: string;
  rel?: string;
  ariaLabel?: string;
};

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  strength = 0.34,
  target,
  rel,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 260, damping: 18, mass: 0.4 });
  const innerX = useTransform(sx, (v) => v * 0.35);
  const innerY = useTransform(sy, (v) => v * 0.35);

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    my.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-500 will-change-transform";

  const variants = {
    primary:
      "bg-white text-[#06070b] px-7 py-3.5 shadow-[0_18px_44px_-18px_rgba(120,170,255,0.75)] hover:bg-white",
    outline:
      "px-7 py-3.5 text-white glass glass-edge hover:border-white/25",
    ghost: "px-5 py-2.5 text-titanium hover:text-white",
  } as const;

  const content = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(100deg, rgba(88,230,255,0.22), rgba(77,141,255,0.22) 45%, rgba(155,123,255,0.22))",
          }}
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 opacity-0 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          animation: "sheen 1.1s var(--ease-out-expo)",
        }}
      />
      <motion.span
        style={{ x: innerX, y: innerY }}
        className="relative z-10 inline-flex items-center gap-2.5"
      >
        {children}
      </motion.span>
    </>
  );

  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn(base, variants[variant], className)}
    >
      {content}
    </Tag>
  );
}
