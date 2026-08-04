import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

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

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(t("address"))}&output=embed`;

  return (
    <>
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

      {/* Details + map */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {rows.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
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

          <div className="min-h-[340px] overflow-hidden rounded-2xl border border-border shadow-xl shadow-black/20">
            <iframe
              title={t("mapTitle")}
              src={mapSrc}
              className="h-full min-h-[340px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <ContactForm email={t("email")} />
        </div>
      </section>
    </>
  );
}
