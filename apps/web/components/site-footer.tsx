import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const LINKS = [
  { href: "/about", ns: "nav", key: "about" },
  { href: "/contact", ns: "nav", key: "contact" },
  { href: "/faq", ns: "nav", key: "faq" },
  { href: "/terms", ns: "footer", key: "terms" },
] as const;

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted">
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.ns === "footer" ? t(item.key) : nav(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col justify-between gap-2 border-t border-border pt-4 sm:flex-row">
          <span>&copy; 2026 AutoRent. {t("rights")}</span>
          <span>{t("tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
