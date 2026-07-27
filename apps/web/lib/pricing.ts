import type { RateCard, ExtraSelection, PromoInput } from "@autorent/schemas";

/**
 * Pricing. All money is integer euro cents. Tiered rates are applied
 * automatically by rental length: whole months bill at the monthly rate,
 * remaining whole weeks at the weekly rate, and leftover days at the daily
 * rate — so a longer rental is always at least as cheap per day.
 */

export const DAYS_PER_WEEK = 7;
export const DAYS_PER_MONTH = 30;

export interface PriceBreakdown {
  days: number;
  months: number;
  weeks: number;
  extraDays: number;
  baseCents: number;
  extrasCents: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

function assertPositiveDays(days: number): void {
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError("days must be a positive integer");
  }
}

export function splitByTier(days: number): { months: number; weeks: number; extraDays: number } {
  assertPositiveDays(days);
  const months = Math.floor(days / DAYS_PER_MONTH);
  const afterMonths = days % DAYS_PER_MONTH;
  const weeks = Math.floor(afterMonths / DAYS_PER_WEEK);
  const extraDays = afterMonths % DAYS_PER_WEEK;
  return { months, weeks, extraDays };
}

export function computeBaseCents(rate: RateCard, days: number, seasonalMultiplier = 1): number {
  const { months, weeks, extraDays } = splitByTier(days);
  const raw =
    months * rate.monthlyRateCents + weeks * rate.weeklyRateCents + extraDays * rate.dailyRateCents;
  return Math.round(raw * seasonalMultiplier);
}

export function computeExtrasCents(extras: ExtraSelection[], days: number): number {
  return extras.reduce(
    (sum, extra) => sum + (extra.priceType === "per_day" ? extra.priceCents * days : extra.priceCents),
    0,
  );
}

/** Discount from a validated promo, never more than the subtotal. */
export function computeDiscountCents(subtotalCents: number, promo?: PromoInput | null): number {
  if (!promo) return 0;
  const raw =
    promo.kind === "percentage"
      ? Math.round(subtotalCents * (promo.amount / 100))
      : promo.amount;
  return Math.min(Math.max(raw, 0), subtotalCents);
}

export function quote(input: {
  rate: RateCard;
  days: number;
  extras?: ExtraSelection[];
  promo?: PromoInput | null;
  seasonalMultiplier?: number;
}): PriceBreakdown {
  const { rate, days, extras = [], promo = null, seasonalMultiplier = 1 } = input;
  const { months, weeks, extraDays } = splitByTier(days);
  const baseCents = computeBaseCents(rate, days, seasonalMultiplier);
  const extrasCents = computeExtrasCents(extras, days);
  const subtotalCents = baseCents + extrasCents;
  const discountCents = computeDiscountCents(subtotalCents, promo);
  return {
    days,
    months,
    weeks,
    extraDays,
    baseCents,
    extrasCents,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
}

/**
 * Marginal cost of extending a rental by `addedDays`. Tier discounts apply to
 * the new total length, so the extension can be cheaper than the added days at
 * the daily rate.
 */
export function quoteExtensionCents(input: {
  rate: RateCard;
  originalDays: number;
  addedDays: number;
  seasonalMultiplier?: number;
}): number {
  const { rate, originalDays, addedDays, seasonalMultiplier = 1 } = input;
  if (!Number.isInteger(addedDays) || addedDays < 1) {
    throw new RangeError("addedDays must be a positive integer");
  }
  const full = computeBaseCents(rate, originalDays + addedDays, seasonalMultiplier);
  const original = computeBaseCents(rate, originalDays, seasonalMultiplier);
  return full - original;
}
