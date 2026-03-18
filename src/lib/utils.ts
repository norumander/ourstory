/**
 * Merge CSS class names, filtering out falsy values.
 * Simple alternative to clsx — no dependency needed for this.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format cents as a display currency string.
 * @param cents - Amount in cents (integer)
 * @returns Formatted string like "$1,234"
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Calculate progress percentage, clamped to 0–100.
 */
export function calculateProgress(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}

/**
 * Derive a username from an email address.
 * Takes the part before @, lowercases it.
 */
export function deriveUsername(email: string): string {
  return email.split("@")[0].toLowerCase();
}

/**
 * Generate initials from a display name (1-2 characters).
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
