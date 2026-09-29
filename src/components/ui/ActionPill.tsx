"use client";

import type { MouseEventHandler } from "react";
import "./ActionPill.css";

type ActionPillProps = {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  portal?: boolean;
  className?: string;
};

const contents = (label: string) => (
  <>
    <span aria-hidden className="action-pill__fill" />
    <span className="action-pill__label relative z-[1]">{label}</span>
    <span aria-hidden className="action-pill__icon">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
    </span>
  </>
);

export default function ActionPill({ label, href, onClick, portal = false, className = "" }: ActionPillProps) {
  const classes = `action-pill ${className}`.trim();
  if (href) return <a href={href} className={classes}>{contents(label)}</a>;
  return <button data-services-pill={portal ? "" : undefined} type="button" onClick={onClick} className={classes}>{contents(label)}</button>;
}
