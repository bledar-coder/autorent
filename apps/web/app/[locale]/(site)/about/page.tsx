import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, Eye, HeartHandshake, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STORY_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Mercedes-AMG_C_63_%28W206%29_IMG_0310.jpg/1280px-Mercedes-AMG_C_63_%28W206%29_IMG_0310.jpg";
const CITY_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Prishtina_cityscape.jpg/1920px-Prishtina_cityscape.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return { title: t("title"), description: t("lead") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");
  const contact = await getTranslations("pages.contact");
  const carCount = await prisma.vehicle.count({ where: { status: "active" } }).catch(() => 12);
  const ratingAgg = await prisma.review
    .aggregate({ _avg: { rating: true }, where: { status: "approved" } })
    .catch(() => null);
  const avgRating = ratingAgg?._avg.rating ? ratingAgg._avg.rating.toFixed(1) : "5.0";

  const stats = [
    { value: `${carCount}+`, label: t("statCarsLabel") },
    { value: avgRating, label: t("statRatingLabel") },
    { value: "100%", label: t("statOnlineLabel") },
    { value: "48h", label: t("statCancelLabel") },
  ];
  const values = [
    { icon: ShieldCheck, title: t("value1Title"), text: t("value1Text") },
    { icon: Eye, title: t("value2Title"), text: t("value2Text") },
    { icon: HeartHandshake, title: t("value3Title"), text: t("value3Text") },
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
              "radial-gradient(55% 55% at 85% -10%, rgba(76,130,255,0.18), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-28">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">{t("kicker")}</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t("lead")}</p>
        </div>
      </section>

      {/* Story + image */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("storyTitle")}</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-foreground/90">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-xl shadow-black/20">
            <Image
              src={STORY_IMG}
              alt="AutoRent vehicle"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("valuesTitle")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/50"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-border bg-surface/30">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div className="relative order-last aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-xl shadow-black/20 lg:order-first">
            <Image
              src={CITY_IMG}
              alt="Prishtina, Kosovo"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("locationTitle")}</h2>
            <p className="mt-3 text-muted">{t("locationText")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {contact("address")}
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {contact("phone")}
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {contact("hours")}
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {contact("title")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

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
