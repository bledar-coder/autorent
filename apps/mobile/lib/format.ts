/** Whole-euro price from integer cents (kept simple for Hermes, no Intl needed). */
export function formatPrice(cents: number): string {
  return `€${Math.round(cents / 100)}`;
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatClass(value: string): string {
  return value === "suv" ? "SUV" : titleCase(value);
}

/** YYYY-MM-DD for a Date, in local time. */
export function toDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
