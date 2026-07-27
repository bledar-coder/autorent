import { describe, it, expect } from "vitest";
import type { RateCard } from "@autorent/schemas";
import {
  quote,
  computeExtrasCents,
  computeDiscountCents,
  quoteExtensionCents,
  splitByTier,
} from "./pricing";

// €50/day, €300/week (~€42.86/day), €1000/month (~€33.33/day)
const rate: RateCard = { dailyRateCents: 5000, weeklyRateCents: 30000, monthlyRateCents: 100000 };

describe("splitByTier", () => {
  it("splits days into months / weeks / leftover days", () => {
    expect(splitByTier(3)).toEqual({ months: 0, weeks: 0, extraDays: 3 });
    expect(splitByTier(7)).toEqual({ months: 0, weeks: 1, extraDays: 0 });
    expect(splitByTier(10)).toEqual({ months: 0, weeks: 1, extraDays: 3 });
    expect(splitByTier(35)).toEqual({ months: 1, weeks: 0, extraDays: 5 });
    expect(splitByTier(37)).toEqual({ months: 1, weeks: 1, extraDays: 0 });
  });

  it("rejects non-positive or fractional days", () => {
    expect(() => splitByTier(0)).toThrow();
    expect(() => splitByTier(2.5)).toThrow();
  });
});

describe("quote base pricing (tiers auto-apply by length)", () => {
  it("charges the daily rate for a short rental", () => {
    expect(quote({ rate, days: 3 }).baseCents).toBe(15000);
  });

  it("uses the cheaper weekly rate at exactly 7 days", () => {
    expect(quote({ rate, days: 7 }).baseCents).toBe(30000); // < 7 * 5000
  });

  it("mixes weekly + daily for 10 days", () => {
    expect(quote({ rate, days: 10 }).baseCents).toBe(45000); // 30000 + 3*5000
  });

  it("uses the monthly rate at 30 days", () => {
    expect(quote({ rate, days: 30 }).baseCents).toBe(100000);
  });

  it("mixes monthly + daily for 35 days", () => {
    expect(quote({ rate, days: 35 }).baseCents).toBe(125000); // 100000 + 5*5000
  });
});

describe("extras", () => {
  it("charges per-day and flat extras correctly", () => {
    const extras = [
      { id: "gps", name: "GPS", priceCents: 500, priceType: "per_day" as const },
      { id: "seat", name: "Child seat", priceCents: 2000, priceType: "flat" as const },
    ];
    expect(computeExtrasCents(extras, 4)).toBe(4000); // 4*500 + 2000
  });
});

describe("promo codes", () => {
  it("applies a percentage discount", () => {
    expect(computeDiscountCents(20000, { code: "SUMMER", kind: "percentage", amount: 10 })).toBe(2000);
  });

  it("applies a fixed discount", () => {
    expect(computeDiscountCents(20000, { code: "OFF20", kind: "fixed", amount: 2000 })).toBe(2000);
  });

  it("never discounts more than the subtotal", () => {
    expect(computeDiscountCents(1500, { code: "HUGE", kind: "fixed", amount: 9999 })).toBe(1500);
  });
});

describe("seasonal multiplier + full quote", () => {
  it("applies a seasonal multiplier to the base only", () => {
    const q = quote({ rate, days: 3, seasonalMultiplier: 1.2 });
    expect(q.baseCents).toBe(18000); // 15000 * 1.2
  });

  it("produces a consistent breakdown", () => {
    const q = quote({
      rate,
      days: 10,
      extras: [{ id: "gps", name: "GPS", priceCents: 500, priceType: "per_day" }],
      promo: { code: "TEN", kind: "percentage", amount: 10 },
    });
    expect(q.baseCents).toBe(45000);
    expect(q.extrasCents).toBe(5000);
    expect(q.subtotalCents).toBe(50000);
    expect(q.discountCents).toBe(5000);
    expect(q.totalCents).toBe(45000);
  });
});

describe("extension pricing (marginal, tier-aware)", () => {
  it("prices extra days against the new total length", () => {
    // 5 days -> 7 days: full week (30000) minus 5 days (25000) = 5000
    expect(quoteExtensionCents({ rate, originalDays: 5, addedDays: 2 })).toBe(5000);
  });

  it("charges the daily rate for a plain extension", () => {
    expect(quoteExtensionCents({ rate, originalDays: 2, addedDays: 1 })).toBe(5000);
  });
});
