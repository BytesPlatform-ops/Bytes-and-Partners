import { site } from "@/data/site";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <div id="contact" className={styles.stage}>
    <footer data-site-footer className={styles.footer}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>{site.name} / Denton, Texas</p>
        <a className={styles.email} href={`mailto:${site.email}`}>{site.email}</a>
      </div>

      <div className={styles.contactGrid}>
        <section><p className={styles.label}>Phone · Toll free</p><a className={styles.underlined} href={site.phoneHref}>{site.phone}</a></section>
        <address>
          <p className={styles.label}>Address</p>
          <a className={styles.addressLink} href={site.address.map} target="_blank" rel="noreferrer">
            <span>{site.address.street}</span>
            <span>{site.address.city}, {site.address.region}</span>
            <span>United States</span>
          </a>
        </address>
        <nav aria-label="Social media" className={styles.socials}>
          <p className={styles.label}>Social</p>
          <a className={styles.motionLink} href={site.social.facebook} target="_blank" rel="noreferrer"><span aria-hidden>↗</span><span>Facebook</span></a>
          <a className={styles.motionLink} href={site.social.instagram} target="_blank" rel="noreferrer"><span aria-hidden>↗</span><span>Instagram</span></a>
          <a className={styles.motionLink} href={site.social.linkedin} target="_blank" rel="noreferrer"><span aria-hidden>↗</span><span>LinkedIn</span></a>
        </nav>
      </div>

      <div className={styles.wordmark} aria-label="BytesPlatform"><span>BytesPlatform<span className={styles.period}>.</span></span></div>

      <div className={styles.legal}>
        <p>© 2026 {site.legalName}</p>
        <nav className={styles.policyLinks} aria-label="Policies"><a href={site.links.privacy}>Privacy</a><a href={site.links.terms}>Terms</a><a href={site.links.refund}>Refund policy</a></nav>
        <a href="#top" aria-label="Back to top">↑</a>
      </div>
    </footer>
    </div>
  );
}
