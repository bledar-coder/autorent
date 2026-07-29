import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getFeaturedVehicles } from "@/lib/queries/vehicles";
import { VehicleCard } from "@/components/vehicle-card";

// render on demand so the build never depends on the database being reachable
export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const common = await getTranslations("common");
  const av = await getTranslations("availability");
  const featured = await getFeaturedVehicles(3).catch(() => []);

  const DAY = 24 * 60 * 60 * 1000;
  const pad = (x: number) => String(x).padStart(2, "0");
  const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date();
  const defFrom = ymd(new Date(now.getTime() + DAY));
  const defTo = ymd(new Date(now.getTime() + 4 * DAY));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 0%, rgba(76,130,255,0.18), transparent 60%), radial-gradient(50% 50% at 0% 100%, rgba(76,130,255,0.10), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Prishtina &middot; Kosovo
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{t("heroSubtitle")}</p>
          <form
            action={`/${locale}/availability`}
            method="get"
            className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 backdrop-blur sm:max-w-xl sm:flex-row sm:items-end"
          >
            <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
              {av("pickup")}
              <input
                type="date"
                name="from"
                defaultValue={defFrom}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
              {av("return")}
              <input
                type="date"
                name="to"
                defaultValue={defTo}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Search className="h-4 w-4" />
              {t("searchCta")}
            </button>
          </form>
          <Link
            href="/fleet"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            {t("viewFleet")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Featured vehicles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t("featured")}</h2>
          <Link href="/fleet" className="text-sm text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              locale={locale}
              perDayLabel={common("perDay")}
            />
          ))}
        </div>
      </section>
    </>
  );
}
