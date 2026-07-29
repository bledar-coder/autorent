import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { PaymentStatus, RefundStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { canTransition } from "@/lib/booking-state";
import { computeRefund } from "@/lib/refund";
import { notifyBooking } from "@/lib/notifications";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Sign in required" } }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { vehicle: { select: { name: true } } },
  });
  if (!booking) {
    return NextResponse.json({ error: { code: "not_found", message: "Booking not found" } }, { status: 404 });
  }

  const isOwner = booking.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: { code: "forbidden", message: "Not allowed" } }, { status: 403 });
  }

  if (!canTransition(booking.status, "cancelled")) {
    return NextResponse.json(
      { error: { code: "not_cancellable", message: "This booking can't be cancelled" } },
      { status: 409 },
    );
  }

  const hoursBeforePickup = (booking.startAt.getTime() - Date.now()) / 3_600_000;
  const refund =
    booking.paymentStatus === "paid"
      ? computeRefund(booking.totalCents, hoursBeforePickup)
      : { refundCents: 0, kind: "none" as const };

  let refundStatus: RefundStatus = "none";
  let paymentStatus: PaymentStatus = booking.paymentStatus;

  if (refund.refundCents > 0 && booking.stripePaymentIntentId) {
    try {
      await getStripe().refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        amount: refund.refundCents,
      });
      refundStatus = refund.kind === "full" ? "full" : "partial";
      paymentStatus = refund.kind === "full" ? "refunded" : "partially_refunded";
    } catch {
      refundStatus = "failed";
    }
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "cancelled", refundStatus, refundCents: refund.refundCents, paymentStatus, holdExpiresAt: null },
  });

  await notifyBooking("booking_cancelled", booking, { refundCents: refund.refundCents });

  return NextResponse.json({ ok: true, refundCents: refund.refundCents, refundStatus });
}
