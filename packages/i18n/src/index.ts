import sq from "../messages/sq.json" with { type: "json" };
import en from "../messages/en.json" with { type: "json" };

export const locales = ["sq", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sq";

export const messages = { sq, en };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getMessages(locale: Locale) {
  return messages[locale];
}
