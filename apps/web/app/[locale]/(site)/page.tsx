import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Search, ShieldCheck, Zap, CalendarClock, MapPin, Check, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getFeaturedVehicles } from "@/lib/queries/vehicles";
import { prisma } from "@/lib/db";
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
  const reviews = await prisma.review
    .findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { user: { select: { name: true } }, vehicle: { select: { name: true } } },
    })
    .catch(() => []);

  const DAY = 24 * 60 * 60 * 1000;
  const pad = (x: number) => String(x).padStart(2, "0");
  const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date();
  const defFrom = ymd(new Date(now.getTime() + DAY));
  const defTo = ymd(new Date(now.getTime() + 4 * DAY));

  const trust = [t("trustInstant"), t("trustCancel"), t("trustSecure")];
  const why = [
    { icon: ShieldCheck, title: t("whyInsuredTitle"), text: t("whyInsuredText") },
    { icon: Zap, title: t("whyInstantTitle"), text: t("whyInstantText") },
    { icon: CalendarClock, title: t("whyFlexibleTitle"), text: t("whyFlexibleText") },
    { icon: MapPin, title: t("whyLocalTitle"), text: t("whyLocalText") },
  ];
  const steps = [
    { title: t("step1Title"), text: t("step1Text") },
    { title: t("step2Title"), text: t("step2Text") },
    { title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div
          className="animate-glow pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 55% at 82% -5%, rgba(76,130,255,0.22), transparent 60%), radial-gradient(45% 45% at 0% 100%, rgba(76,130,255,0.12), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Prishtina &middot; Kosovo
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">{t("heroTitle")}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{t("heroSubtitle")}</p>

            <form
              action={`/${locale}/availability`}
              method="get"
              className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-3 shadow-xl shadow-black/20 backdrop-blur sm:max-w-xl sm:flex-row sm:items-end"
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

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              {trust.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why AutoRent */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("whyTitle")}</h2>
          <p className="mt-2 text-muted">{t("whySubtitle")}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured vehicles */}
      <section className="border-y border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("featured")}</h2>
            <Link
              href="/fleet"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
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
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("stepsTitle")}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map(({ title, text }, i) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 ? (
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("reviewsTitle")}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  {r.comment ? (
                    <blockquote className="mt-3 text-sm text-foreground/90">&ldquo;{r.comment}&rdquo;</blockquote>
                  ) : null}
                  <figcaption className="mt-3 text-sm text-muted">
                    {r.user.name} &middot; {r.vehicle.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface to-surface p-8 sm:p-12">
          <div className="animate-glow pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("ctaTitle")}</h2>
            <p className="mt-2 max-w-md text-muted">{t("ctaText")}</p>
            <Link
              href="/fleet"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
