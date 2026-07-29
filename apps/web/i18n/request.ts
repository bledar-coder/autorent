import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { messages, isLocale } from "@autorent/i18n";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    // Arrays in the catalogs (FAQ/terms) are read via t.raw; next-intl's message
    // type doesn't model arrays, so cast to satisfy it while keeping runtime intact.
    messages: messages[locale] as unknown as AbstractIntlMessages,
  };
});
