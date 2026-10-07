import type { CSSProperties } from "react";
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
  triggerSize: { width: number; height: number };
};

export default function SiteMenu({ open, onClose, triggerSize }: SiteMenuProps) {
  const panelStyle = {
    "--trigger-width": `${triggerSize.width}px`,
    "--trigger-height": `${triggerSize.height}px`,
  } as CSSProperties;

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
        id="site-menu"
        className={styles.panel}
        data-open={open}
        style={panelStyle}
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
