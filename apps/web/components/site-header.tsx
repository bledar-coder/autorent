import { getTranslations } from "next-intl/server";
import { Car } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { AuthMenu } from "./auth-menu";

const NAV = [
  { href: "/", key: "home" },
  { href: "/fleet", key: "fleet" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
  { href: "/faq", key: "faq" },
] as const;

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#8AB0FF] text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105">
            <Car className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Auto<span className="text-primary">Rent</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
