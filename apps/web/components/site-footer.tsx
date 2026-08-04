import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SportsCarMark } from "./sports-car-mark";

const LINKS = [
  { href: "/fleet", ns: "nav", key: "fleet" },
  { href: "/about", ns: "nav", key: "about" },
  { href: "/contact", ns: "nav", key: "contact" },
  { href: "/faq", ns: "nav", key: "faq" },
  { href: "/terms", ns: "footer", key: "terms" },
] as const;

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#8AB0FF] text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/10">
                <SportsCarMark className="h-4 w-8" />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Auto<span className="text-primary">Rent</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">{t("tagline")}</p>
            <p className="mt-1 text-sm text-muted">Prishtina, Kosovo</p>
          </div>

          <nav className="flex flex-col gap-2.5 text-sm" aria-label="Footer">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted transition-colors hover:text-foreground"
              >
                {item.ns === "footer" ? t(item.key) : nav(item.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-border pt-6 text-sm text-muted">
          <span>&copy; 2026 AutoRent. {t("rights")}</span>
          <span className="text-xs">Vehicle photography via Wikimedia Commons (CC BY-SA).</span>
        </div>
      </div>
    </footer>
  );
}
