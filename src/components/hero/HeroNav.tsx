"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import NavButton from "../ui/NavButton";
import SiteMenu from "./SiteMenu";

/**
 * Deliberately not a navbar. An identity, one action, one control — thin
 * borders, no fills, no shadows, nothing that reads as a SaaS button bar.
 *
 * Fixed above the whole page, in its own layer: it never scrolls, fades or
 * takes part in any section's animation. The bar itself lets clicks through;
 * only its children catch them.
 */
export default function HeroNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [triggerSize, setTriggerSize] = useState({ width: 112, height: 48 });
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  useLayoutEffect(() => {
    const button = menuButton.current;
    if (!button) return;
    const measure = () => {
      const { width, height } = button.getBoundingClientRect();
      setTriggerSize({ width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setButtonActive(false);
      closeTimer.current = null;
    }, 560);
  }, []);

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (menuButton.current) {
      const { width, height } = menuButton.current.getBoundingClientRect();
      setTriggerSize({ width, height });
    }
    setButtonActive(true);
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeMenu, menuOpen]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  return (
    <header data-hero-nav className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-6 px-[var(--bp-gut)] pt-[var(--bp-gut)] [&>*]:pointer-events-auto">
      <a
        href="#top"
        aria-label="Bytes and Partners — home"
        className="hero-mark text-ink transition-opacity duration-500 hover:opacity-60"
      >
        Bytes &amp; Partners
      </a>

      <div className="relative flex items-center gap-2 sm:gap-3">
        <NavButton variant="action" href="#contact">Start a project</NavButton>
        <NavButton
          variant="menu"
          className="relative z-[2]"
          expanded={menuOpen}
          active={buttonActive}
          controls="site-menu"
          onClick={toggleMenu}
          buttonRef={menuButton}
        >
          {buttonActive ? "Close" : "Menu"}
        </NavButton>
        <SiteMenu open={menuOpen} onClose={closeMenu} triggerSize={triggerSize} />
      </div>
    </header>
  );
}
