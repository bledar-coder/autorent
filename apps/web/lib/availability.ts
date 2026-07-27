import type { BookingStatus } from "@autorent/schemas";

/**
 * Availability engine. A vehicle's availability is DERIVED from its blocking
 * bookings + maintenance blocks — never stored as a flag. Ranges are half-open
 * [start, end), so a return at 10:00 and a pickup at 10:00 do not collide.
 */

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BookingLike {
  start: Date;
  end: Date;
  status: BookingStatus;
  /** for pending_payment bookings: the checkout hold expiry */
  holdExpiresAt?: Date | null;
}

export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.start < b.end && b.start < a.end;
}

function assertValidRange(range: DateRange): void {
  if (range.end <= range.start) {
    throw new RangeError("range end must be after start");
  }
}

/** Which bookings + maintenance blocks actually hold a vehicle at `now`. */
export function blockingRanges(
  bookings: BookingLike[],
  maintenance: DateRange[],
  now: Date,
): DateRange[] {
  const fromBookings = bookings
    .filter((booking) => {
      if (booking.status === "confirmed" || booking.status === "active") return true;
      if (booking.status === "pending_payment") {
        return booking.holdExpiresAt ? booking.holdExpiresAt > now : false;
      }
      // completed and cancelled bookings never block
      return false;
    })
    .map((booking) => ({ start: booking.start, end: booking.end }));
  return [...fromBookings, ...maintenance];
}

export function isRangeFree(requested: DateRange, blocks: DateRange[]): boolean {
  assertValidRange(requested);
  return !blocks.some((block) => rangesOverlap(requested, block));
}

export function isVehicleAvailable(
  requested: DateRange,
  bookings: BookingLike[],
  maintenance: DateRange[],
  now: Date,
): boolean {
  return isRangeFree(requested, blockingRanges(bookings, maintenance, now));
}
