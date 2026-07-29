"use server";

import { redirect } from "next/navigation";
import type { BookingStatus, Prisma } from "@prisma/client";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { assertTransition } from "@/lib/booking-state";
import { computeRefund } from "@/lib/refund";
import { quote, quoteExtensionCents } from "@/lib/pricing";
import { rentalDays } from "@/lib/dates";
import { isVehicleAvailable, type BookingLike, type DateRange } from "@/lib/availability";
import { notifyBooking } from "@/lib/notifications";

const HOLDING_STATUSES: BookingStatus[] = ["pending_payment", "confirmed", "active"];

function reference(): string {
  return "AR-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Advance a booking through its lifecycle; issues a refund when cancelling a paid booking. */
export async function updateBookingStatus(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const target = String(formData.get("target")) as BookingStatus;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { vehicle: { select: { name: true } } },
  });
  if (!booking) throw new Error("Booking not found");
  assertTransition(booking.status, target);

  const data: Prisma.BookingUpdateInput = { status: target };
  let refundCentsForNotify = 0;

  if (target === "confirmed") {
    data.holdExpiresAt = null;
    if (booking.source === "manual" && booking.paymentStatus === "unpaid") {
      data.paymentStatus = "paid_offline";
    }
  }

  if (target === "cancelled") {
    data.holdExpiresAt = null;
    const hoursBefore = (booking.startAt.getTime() - Date.now()) / 3_600_000;
    const refund =
      booking.paymentStatus === "paid"
        ? computeRefund(booking.totalCents, hoursBefore)
        : { refundCents: 0, kind: "none" as const };
    if (refund.refundCents > 0 && booking.stripePaymentIntentId) {
      try {
        await getStripe().refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          amount: refund.refundCents,
        });
        data.refundStatus = refund.kind === "full" ? "full" : "partial";
        data.paymentStatus = refund.kind === "full" ? "refunded" : "partially_refunded";
      } catch {
        data.refundStatus = "failed";
      }
      data.refundCents = refund.refundCents;
    }
    refundCentsForNotify = refund.refundCents;
  }

  await prisma.booking.update({ where: { id }, data });

  if (target === "confirmed") await notifyBooking("booking_confirmed", booking);
  else if (target === "cancelled")
    await notifyBooking("booking_cancelled", booking, { refundCents: refundCentsForNotify });
  else if (target === "completed") await notifyBooking("review_invite", booking);
}

/** Extend an active/confirmed rental, charging the tier-aware difference (collected offline). */
export async function extendBooking(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const newEndDate = String(formData.get("newEnd"));
  const newEnd = new Date(`${newEndDate}T10:00:00`);

  const booking = await prisma.booking.findUnique({ where: { id }, include: { vehicle: true } });
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "confirmed" && booking.status !== "active") {
    throw new Error("Only confirmed or active rentals can be extended");
  }
  if (newEnd <= booking.endAt) throw new Error("New end date must be later");

  const others = await prisma.booking.findMany({
    where: { vehicleId: booking.vehicleId, id: { not: id }, status: { in: HOLDING_STATUSES } },
    select: { startAt: true, endAt: true, status: true, holdExpiresAt: true },
  });
  const blocks = await prisma.maintenanceBlock.findMany({
    where: { vehicleId: booking.vehicleId },
    select: { startAt: true, endAt: true },
  });

  const window: DateRange = { start: booking.endAt, end: newEnd };
  const bookingLikes: BookingLike[] = others.map((b) => ({
    start: b.startAt,
    end: b.endAt,
    status: b.status,
    holdExpiresAt: b.holdExpiresAt,
  }));
  const blockRanges: DateRange[] = blocks.map((m) => ({ start: m.startAt, end: m.endAt }));
  if (!isVehicleAvailable(window, bookingLikes, blockRanges, new Date())) {
    throw new Error("The vehicle is not free for the extended dates");
  }

  const originalDays = rentalDays(booking.startAt, booking.endAt);
  const addedDays = rentalDays(booking.startAt, newEnd) - originalDays;
  const priceCents = quoteExtensionCents({
    rate: {
      dailyRateCents: booking.vehicle.dailyRateCents,
      weeklyRateCents: booking.vehicle.weeklyRateCents,
      monthlyRateCents: booking.vehicle.monthlyRateCents,
    },
    originalDays,
    addedDays,
  });

  await prisma.$transaction([
    prisma.bookingExtension.create({
      data: { bookingId: id, addedDays, newEndAt: newEnd, priceCents, paymentStatus: "paid_offline" },
    }),
    prisma.booking.update({
      where: { id },
      data: {
        endAt: newEnd,
        baseCents: { increment: priceCents },
        totalCents: { increment: priceCents },
      },
    }),
  ]);
}

/** Staff-created booking (no online payment); confirmed immediately. */
export async function createManualBooking(formData: FormData) {
  await assertAdmin();
  const vehicleId = String(formData.get("vehicleId"));
  const start = new Date(`${String(formData.get("startAt"))}T10:00:00`);
  const end = new Date(`${String(formData.get("endAt"))}T10:00:00`);
  const customerName = String(formData.get("customerName")).trim();
  const customerEmail = String(formData.get("customerEmail")).trim();
  const customerPhone = String(formData.get("customerPhone")).trim();
  const markPaid = formData.get("markPaid") === "on";
  const locale = String(formData.get("locale") || "en");

  if (!vehicleId || !customerName || !customerEmail || !customerPhone) {
    throw new Error("Missing required fields");
  }
  if (end <= start) throw new Error("Return must be after pick-up");

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new Error("Vehicle not found");

  const holding = await prisma.booking.findMany({
    where: { vehicleId, status: { in: HOLDING_STATUSES } },
    select: { startAt: true, endAt: true, status: true, holdExpiresAt: true },
  });
  const blocks = await prisma.maintenanceBlock.findMany({
    where: { vehicleId },
    select: { startAt: true, endAt: true },
  });
  const bookingLikes: BookingLike[] = holding.map((b) => ({
    start: b.startAt,
    end: b.endAt,
    status: b.status,
    holdExpiresAt: b.holdExpiresAt,
  }));
  const blockRanges: DateRange[] = blocks.map((m) => ({ start: m.startAt, end: m.endAt }));
  if (!isVehicleAvailable({ start, end }, bookingLikes, blockRanges, new Date())) {
    throw new Error("The vehicle is not free for those dates");
  }

  const days = rentalDays(start, end);
  const breakdown = quote({
    rate: {
      dailyRateCents: vehicle.dailyRateCents,
      weeklyRateCents: vehicle.weeklyRateCents,
      monthlyRateCents: vehicle.monthlyRateCents,
    },
    days,
  });

  const ref = reference();
  const booking = await prisma.booking.create({
    data: {
      reference: ref,
      vehicleId,
      customerName,
      customerEmail,
      customerPhone,
      startAt: start,
      endAt: end,
      status: "confirmed",
      source: "manual",
      paymentStatus: markPaid ? "paid_offline" : "unpaid",
      baseCents: breakdown.baseCents,
      extrasCents: 0,
      discountCents: 0,
      totalCents: breakdown.totalCents,
      extras: [],
    },
    select: { id: true },
  });

  await notifyBooking("booking_confirmed", {
    id: booking.id,
    reference: ref,
    userId: null,
    customerEmail,
    vehicle: { name: vehicle.name },
  });

  redirect(`/${locale}/admin/bookings/${booking.id}`);
}
