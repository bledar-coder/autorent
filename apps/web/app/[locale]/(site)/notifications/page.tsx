import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, XCircle, Flag, Star, Bell } from "lucide-react";
import type { NotificationType } from "@prisma/client";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatDate, formatPrice } from "@/lib/format";
import { markAllRead } from "./actions";

export const dynamic = "force-dynamic";

const ICON: Record<NotificationType, typeof Bell> = {
  booking_confirmed: CheckCircle2,
  booking_cancelled: XCircle,
  booking_completed: Flag,
  review_invite: Star,
};

const ICON_COLOR: Record<NotificationType, string> = {
  booking_confirmed: "text-success",
  booking_cancelled: "text-destructive",
  booking_completed: "text-muted",
  review_invite: "text-warning",
};

type NotificationData = { reference?: string; vehicle?: string; refundCents?: number };

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  const t = await getTranslations("notifications");
  const tAccount = await getTranslations("account");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {hasUnread ? (
          <form action={markAllRead}>
            <button type="submit" className="text-sm text-primary hover:underline">
              {t("markAllRead")}
            </button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-10 text-center text-muted">
          {t("empty")}
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {notifications.map((n) => {
            const Icon = ICON[n.type];
            const data = (n.data ?? {}) as unknown as NotificationData;
            return (
              <li
                key={n.id}
                className={`flex gap-3 rounded-xl border p-4 ${
                  n.read ? "border-border bg-surface" : "border-primary/30 bg-primary/5"
                }`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_COLOR[n.type]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{t(`types.${n.type}.title`)}</p>
                    {!n.read ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {t(`types.${n.type}.body`, {
                      reference: data.reference ?? "",
                      vehicle: data.vehicle ?? "",
                    })}
                  </p>
                  {data.refundCents ? (
                    <p className="mt-0.5 text-sm text-success">
                      {tAccount("refunded", { amount: formatPrice(data.refundCents, locale) })}
                    </p>
                  ) : null}
                  {n.type === "review_invite" ? (
                    <Link href="/account" className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
                      {t("leaveReview")}
                    </Link>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt, locale)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
