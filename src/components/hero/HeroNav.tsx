"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  // True while the menu is mid-animation; every toggle is ignored until it settles.
  const animating = useRef(false);

  const closeMenu = useCallback(() => {
    if (animating.current) return;
    animating.current = true;
    setMenuOpen(false);
  }, []);

  const handleMenuOpened = useCallback(() => {
    animating.current = false;
  }, []);

  const handleMenuClosed = useCallback(() => {
    animating.current = false;
    setButtonActive(false);
  }, []);

  const toggleMenu = () => {
    if (animating.current) return;
    if (menuOpen) {
      closeMenu();
      return;
    }
    animating.current = true;
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

  return (
    <header data-hero-nav className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-6 px-[var(--bp-gut)] pt-[var(--bp-gut)] [&>*]:pointer-events-auto">
      <a
        href="#top"
        aria-label="Bytes — home"
        className="hero-mark text-ink transition-opacity duration-500 hover:opacity-60"
      >
        BYTES.
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
        >
          {buttonActive ? "Close" : "Menu"}
        </NavButton>
        <SiteMenu
          open={menuOpen}
          onClose={closeMenu}
          onOpened={handleMenuOpened}
          onClosed={handleMenuClosed}
        />
      </div>
    </header>
  );
}
