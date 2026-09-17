"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Logo from "./Logo";
import MagneticButton from "@/components/ui/MagneticButton";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    if (open) return;
    setHidden(y > prev && y > 420);
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-[1320px] items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-500 sm:px-4 ${
            solid ? "glass glass-edge shadow-glass" : "border border-transparent"
          }`}
        >
          <a href="#top" className="shrink-0 rounded-lg" aria-label="Bytes and Partners home">
            <Logo />
          </a>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group relative block rounded-full px-4 py-2 text-[0.875rem] text-titanium transition-colors duration-300 hover:text-white"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 scale-90 rounded-full bg-white/7 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                  />
                  <span className="relative">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <MagneticButton
              href="#contact"
              variant="outline"
              className="!hidden !px-5 !py-2.5 !text-[0.875rem] sm:!inline-flex"
              strength={0.2}
            >
              Start a project
            </MagneticButton>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="glass grid h-10 w-10 place-items-center rounded-xl lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <motion.span
                  animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-0 block h-px w-4 bg-white"
                />
                <motion.span
                  animate={open ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-[5px] block h-px w-4 bg-white"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-[10px] block h-px w-4 bg-white"
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-[#05060a]/92 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-full flex-col justify-center px-7">
              <ul className="space-y-1">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="display block border-b border-white/7 py-4 text-[2.25rem] text-white"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.36 }}
                className="mt-10 space-y-1.5 font-mono text-[0.8125rem] text-titanium"
              >
                <a href="mailto:info@bytesandpartners.co" className="block hover:text-white">
                  info@bytesandpartners.co
                </a>
                <a href="tel:+16313889360" className="block hover:text-white">
                  +1 (631) 388-9360
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
