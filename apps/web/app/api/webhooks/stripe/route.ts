import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { canTransition } from "@/lib/booking-state";
import { notifyBooking } from "@/lib/notifications";

// Bookings are confirmed by Stripe webhook only, never by the client.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new NextResponse("Missing webhook signature", { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata?.bookingId;
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { vehicle: { select: { name: true } } },
      });
      // idempotent: only advance a still-pending booking
      if (booking && canTransition(booking.status, "confirmed")) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "confirmed", paymentStatus: "paid", holdExpiresAt: null },
        });
        await notifyBooking("booking_confirmed", booking);
      }
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata?.bookingId;
    if (bookingId) {
      await prisma.booking.updateMany({
        where: { id: bookingId, status: "pending_payment" },
        data: { paymentStatus: "unpaid" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
