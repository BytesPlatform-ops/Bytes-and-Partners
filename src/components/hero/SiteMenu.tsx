"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import styles from "./SiteMenu.module.css";

const links = [
  { label: "Home", href: "#top" },
  { label: "Services", href: "#services" },
  { label: "Featured work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
  onClosed: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function SiteMenu({ open, onClose, onClosed, triggerRef }: SiteMenuProps) {
  const panelRef = useRef<HTMLElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const hasOpened = useRef(false);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger || (!open && !hasOpened.current)) return;

    animationRef.current?.cancel();
    const triggerRect = trigger.getBoundingClientRect();
    const currentRect = panel.getBoundingClientRect();
    const rightGap = window.innerWidth - triggerRect.right;
    const panelWidth = Math.min(432, window.innerWidth - rightGap * 2);
    const expanded = {
      left: triggerRect.right - panelWidth,
      top: triggerRect.top,
      width: panelWidth,
      height: window.innerHeight - triggerRect.top * 2,
      borderRadius: 28,
    };
    const collapsed = {
      left: triggerRect.left,
      top: triggerRect.top,
      width: triggerRect.width,
      height: triggerRect.height,
      borderRadius: triggerRect.height / 2,
    };
    const from = open
      ? (hasOpened.current
          ? { left: currentRect.left, top: currentRect.top, width: currentRect.width, height: currentRect.height, borderRadius: parseFloat(getComputedStyle(panel).borderRadius) }
          : collapsed)
      : { left: currentRect.left, top: currentRect.top, width: currentRect.width, height: currentRect.height, borderRadius: parseFloat(getComputedStyle(panel).borderRadius) };
    const to = open ? expanded : collapsed;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    panel.style.visibility = "visible";
    panel.style.pointerEvents = open ? "auto" : "none";
    const animation = panel.animate(
      [
        { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: `${from.borderRadius}px` },
        { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: `${to.borderRadius}px` },
      ],
      { duration: reducedMotion ? 0 : 680, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
    );
    animationRef.current = animation;
    hasOpened.current = true;

    animation.onfinish = () => {
      panel.style.left = `${to.left}px`;
      panel.style.top = `${to.top}px`;
      panel.style.width = `${to.width}px`;
      panel.style.height = `${to.height}px`;
      panel.style.borderRadius = `${to.borderRadius}px`;
      animation.cancel();
      animationRef.current = null;
      if (!open) {
        panel.style.visibility = "hidden";
        onClosed();
      }
    };

    return () => {
      animation.onfinish = null;
      animation.cancel();
    };
  }, [open, onClosed, triggerRef]);

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        data-open={open}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        id="site-menu"
        className={styles.panel}
        data-open={open}
        aria-hidden={!open}
        aria-label="Site menu"
      >
        <div className={styles.heading}>Navigation</div>
        <nav aria-label="Site navigation" className={styles.links}>
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={open ? 0 : -1}
              style={{ "--item-index": index } as React.CSSProperties}
              onClick={onClose}
            >
              <span>{link.label}</span>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.343 8h11.314m0 0-4.984 4.984M13.657 8 8.673 3.016" />
              </svg>
            </a>
          ))}
        </nav>

        <div className={styles.bottom}>
          <div className={styles.utilityLinks}>
            <a href="#services" tabIndex={open ? 0 : -1}>Process</a>
            <a href="mailto:info@bytesandpartners.co?subject=Careers" tabIndex={open ? 0 : -1}>Careers</a>
            <a href="#work" tabIndex={open ? 0 : -1}>Journal</a>
          </div>
          <div className={styles.socials}>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r="1" className={styles.fill} /></svg>
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 9.2V19M6.2 5.2v.1M10.6 19v-5.5a4 4 0 0 1 8 0V19M10.6 9.2V19" /></svg>
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 20v-7h2.5l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5H17V4.1c-.7-.1-1.4-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V10H9v3h2.3v7" /></svg>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
