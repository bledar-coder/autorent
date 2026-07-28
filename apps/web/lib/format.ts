const LOCALE_MAP: Record<string, string> = { sq: "sq-AL", en: "en-US" };

function intlLocale(locale: string): string {
  return LOCALE_MAP[locale] ?? "en-US";
}

/** Format integer euro cents as localized EUR (whole euros). */
export function formatPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" }).format(date);
}

/** Display label for a vehicle class enum value. */
export function formatVehicleClass(value: string): string {
  return value === "suv" ? "SUV" : value.charAt(0).toUpperCase() + value.slice(1);
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
