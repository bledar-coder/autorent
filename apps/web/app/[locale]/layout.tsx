import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { isLocale } from "@autorent/i18n";
import { routing } from "@/i18n/routing";
import "../globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://autorent-ks.vercel.app";
const DESCRIPTION =
  "Rent a car in Prishtina. Book online, pay instantly, and pick up the keys at our branch.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "AutoRent: Rent a car in Prishtina",
    template: "%s | AutoRent",
  },
  description: DESCRIPTION,
  applicationName: "AutoRent",
  openGraph: {
    type: "website",
    siteName: "AutoRent",
    title: "AutoRent: Rent a car in Prishtina",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoRent: Rent a car in Prishtina",
    description: DESCRIPTION,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
