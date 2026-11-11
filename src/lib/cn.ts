export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** True when a content value is still an unfilled "[PLACEHOLDER]". */
export function isPlaceholder(value: string) {
  return /\[[^\]]+\]/.test(value);
}
