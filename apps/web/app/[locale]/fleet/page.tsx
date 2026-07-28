import { getTranslations, setRequestLocale } from "next-intl/server";
import { vehicleClassSchema, transmissionSchema } from "@autorent/schemas";
import { getVehicles } from "@/lib/queries/vehicles";
import { VehicleCard } from "@/components/vehicle-card";
import { FleetFilters } from "@/components/fleet-filters";
import { Link } from "@/i18n/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function FleetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("fleet");
  const common = await getTranslations("common");

  const parsedClass = vehicleClassSchema.safeParse(first(sp.class));
  const parsedTrans = transmissionSchema.safeParse(first(sp.transmission));
  const seats = Number(first(sp.seats));
  const maxPrice = Number(first(sp.maxPrice));
  const fromStr = first(sp.from);
  const toStr = first(sp.to);
  const from = fromStr ? new Date(fromStr) : undefined;
  const to = toStr ? new Date(toStr) : undefined;
  const range =
    from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && to > from
      ? { start: from, end: to }
      : undefined;

  const vehicles = await getVehicles({
    vehicleClass: parsedClass.success ? parsedClass.data : undefined,
    transmission: parsedTrans.success ? parsedTrans.data : undefined,
    minSeats: Number.isFinite(seats) && seats > 0 ? seats : undefined,
    maxPriceCents: Number.isFinite(maxPrice) && maxPrice > 0 ? Math.round(maxPrice) * 100 : undefined,
    range,
  });

  const count = vehicles.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <FleetFilters />

        <div>
          <p className="mb-4 text-sm text-muted">
            {count === 1 ? t("resultsOne", { count }) : t("resultsOther", { count })}
          </p>

          {count === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
              <p className="text-muted">{t("empty")}</p>
              <Link
                href="/fleet"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {t("emptyAction")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  locale={locale}
                  perDayLabel={common("perDay")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
