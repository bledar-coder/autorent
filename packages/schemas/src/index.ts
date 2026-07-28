import { z } from "zod";

/**
 * Shared enums, Zod schemas and types for AutoRent. Single source of truth used
 * by the web API (boundary validation), the domain logic, and both clients.
 * Money is always integer euro cents.
 */

// ---- enums -----------------------------------------------------------------

export const bookingStatuses = [
  "pending_payment",
  "confirmed",
  "active",
  "completed",
  "cancelled",
] as const;
export const bookingStatusSchema = z.enum(bookingStatuses);
export type BookingStatus = (typeof bookingStatuses)[number];

export const bookingSources = ["online", "manual"] as const;
export const bookingSourceSchema = z.enum(bookingSources);
export type BookingSource = (typeof bookingSources)[number];

export const paymentStatuses = [
  "unpaid",
  "paid_offline",
  "paid",
  "refunded",
  "partially_refunded",
] as const;
export const paymentStatusSchema = z.enum(paymentStatuses);
export type PaymentStatus = (typeof paymentStatuses)[number];

export const refundStatuses = ["none", "pending", "partial", "full", "failed"] as const;
export const refundStatusSchema = z.enum(refundStatuses);
export type RefundStatus = (typeof refundStatuses)[number];

export const transmissions = ["manual", "automatic"] as const;
export const transmissionSchema = z.enum(transmissions);
export type Transmission = (typeof transmissions)[number];

export const fuelTypes = ["petrol", "diesel", "hybrid", "electric"] as const;
export const fuelTypeSchema = z.enum(fuelTypes);
export type FuelType = (typeof fuelTypes)[number];

export const vehicleClasses = [
  "economy",
  "compact",
  "sedan",
  "suv",
  "luxury",
  "van",
] as const;
export const vehicleClassSchema = z.enum(vehicleClasses);
export type VehicleClass = (typeof vehicleClasses)[number];

export const extraPriceTypes = ["per_day", "flat"] as const;
export const extraPriceTypeSchema = z.enum(extraPriceTypes);
export type ExtraPriceType = (typeof extraPriceTypes)[number];

export const promoKinds = ["percentage", "fixed"] as const;
export const promoKindSchema = z.enum(promoKinds);
export type PromoKind = (typeof promoKinds)[number];

export const locales = ["sq", "en"] as const;
export const localeSchema = z.enum(locales);
export type Locale = (typeof locales)[number];

// ---- money helpers ---------------------------------------------------------

/** Non-negative integer euro cents. */
export const centsSchema = z.number().int().nonnegative();

// ---- pricing inputs --------------------------------------------------------

export const extraSelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceCents: centsSchema,
  priceType: extraPriceTypeSchema,
});
export type ExtraSelection = z.infer<typeof extraSelectionSchema>;

export const promoInputSchema = z.object({
  code: z.string(),
  kind: promoKindSchema,
  /** percentage: 1–100; fixed: euro cents off */
  amount: z.number().int().positive(),
});
export type PromoInput = z.infer<typeof promoInputSchema>;

export const rateCardSchema = z.object({
  dailyRateCents: centsSchema,
  weeklyRateCents: centsSchema,
  monthlyRateCents: centsSchema,
});
export type RateCard = z.infer<typeof rateCardSchema>;

// ---- booking input ---------------------------------------------------------

export const bookingCustomerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
});
export type BookingCustomer = z.infer<typeof bookingCustomerSchema>;

export const bookingCreateSchema = z
  .object({
    vehicleSlug: z.string().min(1),
    startAt: z.string().datetime({ offset: true }),
    endAt: z.string().datetime({ offset: true }),
    extraIds: z.array(z.string()).default([]),
    promoCode: z.string().trim().optional(),
    customer: bookingCustomerSchema,
  })
  .refine((v) => new Date(v.endAt) > new Date(v.startAt), {
    message: "Return must be after pick-up",
    path: ["endAt"],
  });
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
