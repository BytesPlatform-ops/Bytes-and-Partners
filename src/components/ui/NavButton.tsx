import type { MouseEventHandler, ReactNode, Ref } from "react";
import styles from "./NavButton.module.css";

type CommonProps = {
  children: ReactNode;
  className?: string;
};

type ActionProps = CommonProps & {
  variant: "action";
  href: string;
};

type MenuProps = CommonProps & {
  variant: "menu";
  expanded?: boolean;
  active?: boolean;
  controls?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  buttonRef?: Ref<HTMLButtonElement>;
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.343 8h11.314m0 0-4.984 4.984M13.657 8 8.673 3.016" />
  </svg>
);

const content = (variant: ActionProps["variant"] | MenuProps["variant"], children: ReactNode) => (
  <>
    {variant === "action" && <span className={styles.arrow}><Arrow /></span>}
    <span className={styles.label}>{children}</span>
    {variant === "action" ? (
      <span className={styles.dot} aria-hidden />
    ) : (
      <span className={styles.menuDots} aria-hidden><span /><span /></span>
    )}
  </>
);

export default function NavButton(props: ActionProps | MenuProps) {
  const className = `${styles.button} ${styles[props.variant]} ${props.className ?? ""}`.trim();

  if (props.variant === "action") {
    return <a href={props.href} className={className}>{content(props.variant, props.children)}</a>;
  }

  return (
    <button
      type="button"
      className={className}
      aria-expanded={props.expanded ?? false}
      data-active={props.active ?? props.expanded ?? false}
      aria-controls={props.controls}
      onClick={props.onClick}
      ref={props.buttonRef}
    >
      {content(props.variant, props.children)}
    </button>
  );
}
