import type { BookingCreateInput, ExtraSelection, PromoInput } from "@autorent/schemas";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { quote } from "@/lib/pricing";
import { rentalDays } from "@/lib/dates";
import { isVehicleAvailable, type BookingLike, type DateRange } from "@/lib/availability";

const HOLD_MINUTES = 15;
const HOLDING_STATUSES = ["pending_payment", "confirmed", "active"] as const;

export class BookingError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

function genReference(): string {
  return "AR-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function isPromoValid(promo: {
  active: boolean;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number | null;
  usedCount: number;
}): boolean {
  const now = new Date();
  if (!promo.active) return false;
  if (now < promo.validFrom || now > promo.validUntil) return false;
  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) return false;
  return true;
}

export async function createBooking(
  input: BookingCreateInput & { userId?: string | null },
): Promise<{ booking: { id: string; reference: string; totalCents: number }; clientSecret: string }> {
  const start = new Date(input.startAt);
  const end = new Date(input.endAt);
  const days = rentalDays(start, end);
  const range: DateRange = { start, end };

  // availability check + booking creation are atomic to prevent double-booking
  const booking = await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { slug: input.vehicleSlug } });
    if (!vehicle || vehicle.status !== "active") {
      throw new BookingError("vehicle_unavailable", "This vehicle is not available.");
    }

    const holding = await tx.booking.findMany({
      where: { vehicleId: vehicle.id, status: { in: [...HOLDING_STATUSES] } },
      select: { startAt: true, endAt: true, status: true, holdExpiresAt: true },
    });
    const maintenance = await tx.maintenanceBlock.findMany({
      where: { vehicleId: vehicle.id },
      select: { startAt: true, endAt: true },
    });

    const bookings: BookingLike[] = holding.map((b) => ({
      start: b.startAt,
      end: b.endAt,
      status: b.status,
      holdExpiresAt: b.holdExpiresAt,
    }));
    const blocks: DateRange[] = maintenance.map((m) => ({ start: m.startAt, end: m.endAt }));

    if (!isVehicleAvailable(range, bookings, blocks, new Date())) {
      throw new BookingError("dates_unavailable", "The vehicle is not free for those dates.");
    }

    const extras = input.extraIds.length
      ? await tx.extra.findMany({ where: { id: { in: input.extraIds }, active: true } })
      : [];
    const extraSelections: ExtraSelection[] = extras.map((e) => ({
      id: e.id,
      name: e.name,
      priceCents: e.priceCents,
      priceType: e.priceType,
    }));

    let promoInput: PromoInput | null = null;
    let promoId: string | null = null;
    if (input.promoCode) {
      const promo = await tx.promoCode.findUnique({ where: { code: input.promoCode } });
      if (promo && isPromoValid(promo)) {
        promoInput = { code: promo.code, kind: promo.kind, amount: promo.amount };
        promoId = promo.id;
      }
    }

    const breakdown = quote({
      rate: {
        dailyRateCents: vehicle.dailyRateCents,
        weeklyRateCents: vehicle.weeklyRateCents,
        monthlyRateCents: vehicle.monthlyRateCents,
      },
      days,
      extras: extraSelections,
      promo: promoInput,
    });

    return tx.booking.create({
      data: {
        reference: genReference(),
        vehicleId: vehicle.id,
        userId: input.userId ?? null,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerPhone: input.customer.phone,
        startAt: start,
        endAt: end,
        status: "pending_payment",
        source: "online",
        paymentStatus: "unpaid",
        baseCents: breakdown.baseCents,
        extrasCents: breakdown.extrasCents,
        discountCents: breakdown.discountCents,
        totalCents: breakdown.totalCents,
        extras: extraSelections,
        promoCodeId: promoId,
        holdExpiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
      },
      select: { id: true, reference: true, totalCents: true },
    });
  });

  // create the payment intent outside the DB transaction; idempotent per booking
  let intent;
  try {
    intent = await getStripe().paymentIntents.create(
      {
        amount: booking.totalCents,
        currency: "eur",
        metadata: { bookingId: booking.id, reference: booking.reference },
        // Card only (Apple/Google Pay ride on card). Avoids EU-specific methods
        // like Bancontact/MB WAY/Satispay/EPS that don't apply to Kosovo.
        payment_method_types: ["card"],
      },
      { idempotencyKey: `booking_${booking.id}` },
    );
  } catch (error) {
    // payment init failed — release the hold so it doesn't block the dates
    await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
    throw error;
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripePaymentIntentId: intent.id },
  });

  if (!intent.client_secret) {
    throw new BookingError("payment_init_failed", "Could not start the payment.");
  }

  return { booking, clientSecret: intent.client_secret };
}
