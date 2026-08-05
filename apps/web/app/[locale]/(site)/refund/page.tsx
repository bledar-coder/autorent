import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Section = { h: string; b: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.refund" });
  return { title: t("title") };
}

export default async function RefundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.refund");
  const sections = t.raw("sections") as Section[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("updated")}</p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.h}>
            <h2 className="font-semibold">{section.h}</h2>
            <p className="mt-1 leading-relaxed text-muted">{section.b}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
