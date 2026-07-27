/**
 * Cancellation / refund policy. Full refund when cancelling at least
 * `fullRefundHoursBefore` hours before pickup, a partial refund inside that
 * window, and nothing once the rental has started. Money is integer cents.
 */

export interface CancellationPolicy {
  fullRefundHoursBefore: number;
  partialRefundPercent: number;
}

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  fullRefundHoursBefore: 48,
  partialRefundPercent: 50,
};

export interface RefundResult {
  refundCents: number;
  kind: "full" | "partial" | "none";
}

export function computeRefund(
  paidCents: number,
  hoursBeforePickup: number,
  policy: CancellationPolicy = DEFAULT_CANCELLATION_POLICY,
): RefundResult {
  if (paidCents <= 0 || hoursBeforePickup < 0) {
    // nothing paid, or the rental has already started
    return { refundCents: 0, kind: "none" };
  }
  if (hoursBeforePickup >= policy.fullRefundHoursBefore) {
    return { refundCents: paidCents, kind: "full" };
  }
  const refundCents = Math.round(paidCents * (policy.partialRefundPercent / 100));
  return { refundCents, kind: refundCents > 0 ? "partial" : "none" };
}
