import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getVehicleBySlug } from "@/lib/queries/vehicles";
import { prisma } from "@/lib/db";
import { BookingForm } from "@/components/booking/booking-form";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const extras = await prisma.extra.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
    select: { id: true, name: true, priceCents: true, priceType: true },
  });
  const sp = await searchParams;
  const t = await getTranslations("booking");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t("title", { vehicle: vehicle.name })}</h1>
      <div className="mt-8">
        <BookingForm
          locale={locale}
          vehicle={{
            slug,
            name: vehicle.name,
            dailyRateCents: vehicle.dailyRateCents,
            weeklyRateCents: vehicle.weeklyRateCents,
            monthlyRateCents: vehicle.monthlyRateCents,
          }}
          extras={extras}
          defaultFrom={first(sp.from) ?? ""}
          defaultTo={first(sp.to) ?? ""}
        />
      </div>
    </div>
  );
}
