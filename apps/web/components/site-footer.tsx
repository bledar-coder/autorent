import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-8 text-sm text-muted sm:flex-row">
        <span>&copy; 2026 AutoRent. {t("rights")}</span>
        <span>{t("tagline")}</span>
      </div>
    </footer>
  );
}
