import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getFeaturedVehicles } from "@/lib/queries/vehicles";
import { VehicleCard } from "@/components/vehicle-card";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const common = await getTranslations("common");
  const featured = await getFeaturedVehicles(3);

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
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Search className="h-4 w-4" />
              {t("searchCta")}
            </button>
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-medium text-foreground transition-colors hover:bg-surface"
            >
              {t("viewFleet")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
