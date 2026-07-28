"use client";

import { useMemo, useState, type FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useLocale, useTranslations } from "next-intl";
import type { ExtraSelection } from "@autorent/schemas";
import { quote } from "@/lib/pricing";
import { rentalDays } from "@/lib/dates";
import { formatPrice } from "@/lib/format";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

type VehicleLite = {
  slug: string;
  name: string;
  dailyRateCents: number;
  weeklyRateCents: number;
  monthlyRateCents: number;
};

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function BookingForm({
  vehicle,
  extras,
  defaultFrom,
  defaultTo,
  locale,
}: {
  vehicle: VehicleLite;
  extras: ExtraSelection[];
  defaultFrom: string;
  defaultTo: string;
  locale: string;
}) {
  const t = useTranslations("booking");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [selected, setSelected] = useState<string[]>([]);
  const [promo, setPromo] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = from && to ? rentalDays(new Date(from), new Date(to)) : 0;
  const chosenExtras = useMemo(
    () => extras.filter((e) => selected.includes(e.id)),
    [extras, selected],
  );
  const breakdown = useMemo(
    () =>
      days > 0
        ? quote({
            rate: {
              dailyRateCents: vehicle.dailyRateCents,
              weeklyRateCents: vehicle.weeklyRateCents,
              monthlyRateCents: vehicle.monthlyRateCents,
            },
            days,
            extras: chosenExtras,
          })
        : null,
    [days, vehicle, chosenExtras],
  );

  const valid =
    days > 0 &&
    to > from &&
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.trim().length >= 6;

  async function submit() {
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleSlug: vehicle.slug,
          startAt: new Date(`${from}T10:00:00`).toISOString(),
          endAt: new Date(`${to}T10:00:00`).toISOString(),
          extraIds: selected,
          promoCode: promo.trim() || undefined,
          customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? t("error"));
        return;
      }
      setClientSecret(data.clientSecret as string);
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
        <PaymentStep
          amountLabel={breakdown ? formatPrice(breakdown.totalCents, locale) : ""}
          locale={locale}
        />
      </Elements>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t("pickup")}</span>
            <input type="date" className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t("return")}</span>
            <input type="date" className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>

        {extras.length > 0 && (
          <div>
            <h2 className="mb-2 font-medium">{t("extras")}</h2>
            <div className="space-y-2">
              {extras.map((e) => (
                <label key={e.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(e.id)}
                      onChange={(ev) =>
                        setSelected((s) => (ev.target.checked ? [...s, e.id] : s.filter((id) => id !== e.id)))
                      }
                    />
                    {e.name}
                  </span>
                  <span className="text-muted">
                    {formatPrice(e.priceCents, locale)}
                    {e.priceType === "per_day" ? " /d" : ""}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">{t("promo")}</span>
          <input
            className={`${inputClass} max-w-xs`}
            placeholder={t("promoPlaceholder")}
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
          />
        </label>

        <div>
          <h2 className="mb-2 font-medium">{t("yourDetails")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputClass} placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
            <input className={inputClass} type="email" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inputClass} placeholder={t("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Price summary */}
      <aside className="h-fit space-y-3 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">{vehicle.name}</p>
        {breakdown ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted">{t("days", { days })}</span>
              <span>{formatPrice(breakdown.baseCents, locale)}</span>
            </div>
            {breakdown.extrasCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("extras")}</span>
                <span>{formatPrice(breakdown.extrasCents, locale)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>{t("total")}</span>
              <span>{formatPrice(breakdown.totalCents, locale)}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">—</p>
        )}
        <button
          type="button"
          disabled={!valid || submitting}
          onClick={submit}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t("processing") : t("continue")}
        </button>
      </aside>
    </div>
  );
}

function PaymentStep({ amountLabel, locale }: { amountLabel: string; locale: string }) {
  const t = useTranslations("booking");
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/${locale}/booking/confirmation` },
    });
    if (result.error) {
      setError(result.error.message ?? t("error"));
      setPaying(false);
    }
  }

  return (
    <form onSubmit={pay} className="mx-auto max-w-md space-y-5">
      <h2 className="text-lg font-semibold">{t("payTitle")}</h2>
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {paying ? t("processing") : t("pay", { amount: amountLabel })}
      </button>
    </form>
  );
}
