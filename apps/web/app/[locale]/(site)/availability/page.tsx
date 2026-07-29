import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import {
  blockingRanges,
  isRangeFree,
  rangesOverlap,
  type BookingLike,
  type DateRange,
} from "@/lib/availability";
import { VehiclePhoto } from "@/components/vehicle-photo";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const HOLDING = ["pending_payment", "confirmed", "active"] as const;
const DAY = 24 * 60 * 60 * 1000;

function parseDate(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T10:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function AvailabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("availability");
  const sp = await searchParams;

  const from = parseDate(sp.from);
  const to = parseDate(sp.to);
  const range: DateRange | null = from && to && to > from ? { start: from, end: to } : null;

  const vehicles = await prisma.vehicle.findMany({
    where: { status: "active" },
    orderBy: { dailyRateCents: "asc" },
    include: {
      bookings: {
        where: { status: { in: [...HOLDING] } },
        select: { startAt: true, endAt: true, status: true, holdExpiresAt: true },
      },
      maintenanceBlocks: { select: { startAt: true, endAt: true } },
    },
  });

  const now = new Date();
  const stripStart = startOfDay(from ?? now);
  const days = Array.from({ length: 14 }, (_, i) => new Date(stripStart.getTime() + i * DAY));
  const weekday = new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-US", { weekday: "short" });

  const rows = vehicles.map((v) => {
    const bookings: BookingLike[] = v.bookings.map((b) => ({
      start: b.startAt,
      end: b.endAt,
      status: b.status,
      holdExpiresAt: b.holdExpiresAt,
    }));
    const maintenance: DateRange[] = v.maintenanceBlocks.map((m) => ({ start: m.startAt, end: m.endAt }));
    const blocks = blockingRanges(bookings, maintenance, now);
    const overall = range ? isRangeFree(range, blocks) : null;
    const dayFree = days.map((d) => {
      const dr: DateRange = { start: d, end: new Date(d.getTime() + DAY) };
      return !blocks.some((b) => rangesOverlap(dr, b));
    });
    return { v, overall, dayFree };
  });

  const defFrom = sp.from ?? ymd(new Date(now.getTime() + DAY));
  const defTo = sp.to ?? ymd(new Date(now.getTime() + 4 * DAY));
  const rangeStart = range ? startOfDay(range.start).getTime() : null;
  const inputClass =
    "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-muted">{t("subtitle")}</p>

      {/* Search bar */}
      <form
        action={`/${locale}/availability`}
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{t("pickup")}</span>
          <input type="date" name="from" defaultValue={defFrom} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{t("return")}</span>
          <input type="date" name="to" defaultValue={defTo} className={inputClass} />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("check")}
        </button>
      </form>

      {/* Legend + context */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-success/40" /> {t("free")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-destructive/40" /> {t("booked")}
        </span>
        <span>{range ? t("forRange", { from: sp.from!, to: sp.to! }) : t("hint")}</span>
      </div>

      {/* Rows */}
      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-6 text-muted">{t("empty")}</p>
        ) : (
          rows.map(({ v, overall, dayFree }) => (
            <div key={v.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {/* Vehicle */}
                <div className="flex min-w-[200px] items-center gap-3">
                  <VehiclePhoto
                    src={v.photos[0]}
                    alt={v.name}
                    vehicleClass={v.class}
                    sizes="64px"
                    className="h-14 w-20 shrink-0 rounded-md"
                  />
                  <div>
                    <Link href={`/fleet/${v.slug}`} className="font-semibold hover:underline">
                      {v.name}
                    </Link>
                    <p className="text-sm text-muted">{formatPrice(v.dailyRateCents, locale)}</p>
                  </div>
                </div>

                {/* Day strip */}
                <div className="flex-1 overflow-x-auto">
                  <div className="flex gap-1">
                    {days.map((d, i) => {
                      const free = dayFree[i];
                      const inRange =
                        rangeStart !== null && range
                          ? d.getTime() >= rangeStart && d.getTime() < range.end.getTime()
                          : false;
                      return (
                        <div
                          key={d.toISOString()}
                          className={`flex min-w-[40px] flex-col items-center rounded-md px-1 py-1 ${
                            free ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                          } ${inRange ? "ring-2 ring-primary" : ""}`}
                        >
                          <span className="text-[10px] uppercase opacity-70">{weekday.format(d)}</span>
                          <span className="text-sm font-semibold">{d.getDate()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status + CTA */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  {overall !== null ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        overall ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {overall ? t("available") : t("unavailable")}
                    </span>
                  ) : null}
                  {overall === false ? null : (
                    <Link
                      href={`/fleet/${v.slug}/book`}
                      className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      {t("book")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
