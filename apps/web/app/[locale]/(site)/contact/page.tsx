import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });
  return { title: t("title"), description: t("lead") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.contact");

  const rows = [
    { icon: MapPin, label: t("addressLabel"), value: t("address") },
    { icon: Phone, label: t("phoneLabel"), value: t("phone"), href: `tel:${t("phone").replace(/\s+/g, "")}` },
    { icon: Mail, label: t("emailLabel"), value: t("email"), href: `mailto:${t("email")}` },
    { icon: Clock, label: t("hoursLabel"), value: t("hours") },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-lg text-muted">{t("lead")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
              {href ? (
                <a href={href} className="mt-0.5 block font-medium hover:text-primary">
                  {value}
                </a>
              ) : (
                <p className="mt-0.5 font-medium">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
