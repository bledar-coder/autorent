"use client";

import { useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Warm the other locale(s) so switching is near-instant (no cold round-trip).
  useEffect(() => {
    for (const l of routing.locales) {
      if (l !== locale) router.prefetch(pathname, { locale: l });
    }
  }, [pathname, locale, router]);

  return (
    <div
      className={cn("flex items-center gap-1 text-sm transition-opacity", isPending && "opacity-50")}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => startTransition(() => router.replace(pathname, { locale: l, scroll: false }))}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded px-1.5 py-0.5 uppercase transition-colors",
            l === locale ? "font-semibold text-foreground" : "text-muted hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
