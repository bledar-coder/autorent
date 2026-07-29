import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("booking");

  const paymentIntentId = first(sp.payment_intent);
  const booking = paymentIntentId
    ? await prisma.booking.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        select: { reference: true, status: true },
      })
    : null;

  const confirmed = booking?.status === "confirmed";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {confirmed ? (
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
      ) : (
        <Clock className="mx-auto h-14 w-14 text-warning" />
      )}
      <h1 className="mt-4 text-2xl font-bold">
        {confirmed ? t("confirmedTitle") : t("pendingTitle")}
      </h1>
      <p className="mt-2 text-muted">{confirmed ? t("confirmedText") : t("pendingText")}</p>
      {booking ? (
        <p className="mt-4">
          {t("reference")}: <span className="font-mono font-semibold">{booking.reference}</span>
        </p>
      ) : null}
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
