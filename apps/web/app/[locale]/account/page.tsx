import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatDate } from "@/lib/format";
import { canTransition } from "@/lib/booking-state";
import { CancelButton } from "@/components/account/cancel-button";
import { ReviewForm } from "@/components/account/review-form";

export const dynamic = "force-dynamic";

const STATUS_KEY: Record<string, string> = {
  pending_payment: "statusPending",
  confirmed: "statusConfirmed",
  active: "statusActive",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  const t = await getTranslations("account");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: { startAt: "desc" },
    include: {
      vehicle: { select: { name: true, slug: true } },
      review: { select: { id: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-muted">{t("empty")}</p>
          <Link
            href="/fleet"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {t("browse")}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/fleet/${b.vehicle.slug}`} className="font-semibold hover:underline">
                    {b.vehicle.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(b.startAt, locale)} &rarr; {formatDate(b.endAt, locale)}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-surface-elevated px-2 py-0.5 text-xs">
                    {t(STATUS_KEY[b.status] ?? "statusConfirmed")}
                  </span>
                  {b.refundCents > 0 ? (
                    <p className="mt-1 text-xs text-success">
                      {t("refunded", { amount: formatPrice(b.refundCents, locale) })}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(b.totalCents, locale)}</p>
                  <p className="text-xs text-muted">{b.reference}</p>
                  {canTransition(b.status, "cancelled") ? (
                    <div className="mt-2">
                      <CancelButton bookingId={b.id} />
                    </div>
                  ) : null}
                  {b.status === "completed" ? (
                    b.review ? (
                      <p className="mt-2 text-xs text-muted">{t("reviewed")}</p>
                    ) : (
                      <ReviewForm bookingId={b.id} />
                    )
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
