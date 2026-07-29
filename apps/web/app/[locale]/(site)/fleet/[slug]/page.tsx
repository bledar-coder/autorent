import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Star, Users, DoorOpen, Gauge, Fuel, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getVehicleBySlug } from "@/lib/queries/vehicles";
import { formatPrice, formatVehicleClass, titleCase } from "@/lib/format";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return { title: "AutoRent" };
  return {
    title: `${vehicle.name} | AutoRent`,
    description: vehicle.description ?? `${vehicle.name} for rent at AutoRent Prishtina.`,
    alternates: {
      canonical: `${APP_URL}/${locale}/fleet/${slug}`,
      languages: {
        sq: `${APP_URL}/sq/fleet/${slug}`,
        en: `${APP_URL}/en/fleet/${slug}`,
      },
    },
    openGraph: {
      title: vehicle.name,
      description: vehicle.description ?? undefined,
      type: "website",
    },
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const t = await getTranslations("vehicle");
  const reviews = vehicle.reviews;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.name,
    description: vehicle.description ?? undefined,
    brand: { "@type": "Brand", name: vehicle.make },
    offers: {
      "@type": "Offer",
      price: (vehicle.dailyRateCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  const specs = [
    { icon: Users, label: t("seats"), value: vehicle.seats },
    { icon: DoorOpen, label: t("doors"), value: vehicle.doors },
    { icon: Gauge, label: t("transmission"), value: titleCase(vehicle.transmission) },
    { icon: Fuel, label: t("fuel"), value: titleCase(vehicle.fuelType) },
    { icon: Calendar, label: t("year"), value: vehicle.year },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/fleet"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backToFleet")}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-surface-elevated text-muted">
            {formatVehicleClass(vehicle.class)}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {vehicle.photos.slice(0, 4).map((_, i) => (
              <div key={i} className="aspect-video rounded-md border border-border bg-surface" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.name}</h1>
          <p className="mt-1 text-muted">
            {vehicle.year} &middot; {formatVehicleClass(vehicle.class)}
            {avgRating ? (
              <span className="ml-2 inline-flex items-center gap-1 text-warning">
                <Star className="h-4 w-4 fill-current" /> {avgRating.toFixed(1)}
              </span>
            ) : null}
          </p>

          <div className="mt-6 flex items-end gap-4">
            <div>
              <span className="text-3xl font-bold">{formatPrice(vehicle.dailyRateCents, locale)}</span>
              <span className="text-muted"> {t("perDay")}</span>
            </div>
            <div className="text-sm text-muted">
              {t("weekly")}: {formatPrice(vehicle.weeklyRateCents, locale)} &middot; {t("monthly")}:{" "}
              {formatPrice(vehicle.monthlyRateCents, locale)}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface p-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted">
                  <s.icon className="h-4 w-4" /> {s.label}
                </dt>
                <dd className="mt-1 font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>

          <Link
            href={`/fleet/${vehicle.slug}/book`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            {t("bookNow")}
          </Link>

          <p className="mt-2 text-xs text-muted">{t("deposit")}: {formatPrice(vehicle.depositCents, locale)}</p>
        </div>
      </div>

      {vehicle.description ? (
        <p className="mt-10 max-w-3xl text-muted">{vehicle.description}</p>
      ) : null}

      {vehicle.features.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">{t("features")}</h2>
          <ul className="flex flex-wrap gap-2">
            {vehicle.features.map((f) => (
              <li key={f} className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted">
                {f}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">{t("reviews")}</h2>
        {reviews.length === 0 ? (
          <p className="text-muted">{t("noReviews")}</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5 text-warning">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </span>
                  <span className="text-sm font-medium">{r.user.name}</span>
                </div>
                {r.comment ? <p className="mt-2 text-sm text-muted">{r.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
