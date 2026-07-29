import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface NotificationInput {
  userId?: string | null;
  email?: string | null;
  type: NotificationType;
  data?: Record<string, unknown>;
  bookingId?: string | null;
}

/**
 * A channel that delivers notifications. The in-app implementation writes to the
 * Notification table; a real email/SMS provider can implement this same
 * interface later and be swapped in without touching any call site.
 */
export interface Notifier {
  notify(input: NotificationInput): Promise<void>;
}

class InAppNotifier implements Notifier {
  async notify(input: NotificationInput): Promise<void> {
    await prisma.notification.create({
      data: {
        userId: input.userId ?? null,
        email: input.email ?? null,
        type: input.type,
        data: (input.data ?? {}) as Prisma.InputJsonValue,
        bookingId: input.bookingId ?? null,
      },
    });
  }
}

export const notifier: Notifier = new InAppNotifier();

type BookingRecipient = {
  id: string;
  reference: string;
  userId: string | null;
  customerEmail: string;
  vehicle?: { name: string } | null;
};

/**
 * Fire a booking-related notification. Never throws — a delivery failure must
 * not break the booking flow (e.g. the Stripe webhook).
 */
export async function notifyBooking(
  type: NotificationType,
  booking: BookingRecipient,
  extra: Record<string, unknown> = {},
): Promise<void> {
  try {
    await notifier.notify({
      userId: booking.userId,
      email: booking.customerEmail,
      type,
      bookingId: booking.id,
      data: { reference: booking.reference, vehicle: booking.vehicle?.name ?? "", ...extra },
    });
  } catch {
    // swallow — notifications are best-effort
  }
}
