import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type FaqItem = { q: string; a: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.faq" });
  return { title: t("title"), description: t("lead") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.faq");
  const items = t.raw("items") as FaqItem[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div
          className="animate-glow pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 55% at 85% -10%, rgba(76,130,255,0.18), transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-24">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">{t("kicker")}</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t("lead")}</p>
        </div>
      </section>

      {/* Accordion */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="space-y-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-surface p-4 transition-colors open:border-primary/40"
            >
              <summary className="cursor-pointer list-none font-medium marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted transition-transform group-open:rotate-45 group-open:border-primary group-open:text-primary">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-surface p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">{t("stillTitle")}</h2>
            <p className="mt-1 text-sm text-muted">{t("stillText")}</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("stillCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
