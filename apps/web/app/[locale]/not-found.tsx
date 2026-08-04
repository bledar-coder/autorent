"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SportsCarMark } from "@/components/sports-car-mark";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div
        className="animate-glow pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(45% 45% at 50% 20%, rgba(76,130,255,0.16), transparent 60%)" }}
      />
      <div className="relative">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#8AB0FF] text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/10">
          <SportsCarMark className="h-6 w-11" />
        </span>
        <p className="mt-8 text-6xl font-bold tracking-tight text-primary">{t("code")}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{t("text")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("fleet")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-medium transition-colors hover:bg-surface"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
