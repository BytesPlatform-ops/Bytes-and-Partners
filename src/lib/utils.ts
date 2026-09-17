export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const EASE = [0.16, 1, 0.3, 1] as const;

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
