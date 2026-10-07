import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <div className={styles.stage}>
    <footer id="contact" data-site-footer className={styles.footer}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>Bytes &amp; Partners / New York</p>
        <a className={styles.email} href="mailto:info@bytesandpartners.co">info@bytesandpartners.co</a>
      </div>

      <div className={styles.contactGrid}>
        <section><p className={styles.label}>Phone</p><a className={styles.underlined} href="tel:+16313889360">+1 631 388 9360</a></section>
        <address>
          <p className={styles.label}>Address</p>
          <a className={styles.addressLink} href="https://maps.google.com/?q=675+Hawkins+Road+East+Coram+NY+11727" target="_blank" rel="noreferrer">
            <span>675 Hawkins Road East</span>
            <span>Coram, NY 11727</span>
            <span>United States</span>
          </a>
        </address>
        <nav aria-label="Social media" className={styles.socials}>
          <p className={styles.label}>Social</p>
          <a className={styles.motionLink} href="https://www.facebook.com/" target="_blank" rel="noreferrer"><span aria-hidden>↗</span><span>Facebook</span></a>
          <a className={styles.motionLink} href="https://www.instagram.com/" target="_blank" rel="noreferrer"><span aria-hidden>↗</span><span>Instagram</span></a>
          <a className={styles.motionLink} href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><span aria-hidden>↗</span><span>LinkedIn</span></a>
        </nav>
      </div>

      <div className={styles.wordmark} aria-label="Bytes and Partners"><span>Bytes</span><span>&amp;</span><span>Partners</span></div>

      <div className={styles.legal}>
        <p>© 2026 Bytes &amp; Partners</p>
        <p>Technology shaped with intent.</p>
        <a href="#top" aria-label="Back to top">↑</a>
      </div>
    </footer>
    </div>
  );
}
