import { describe, it, expect } from "vitest";
import { computeRefund, DEFAULT_CANCELLATION_POLICY } from "./refund";

describe("computeRefund (48h policy, 50% partial)", () => {
  it("full refund well before the window", () => {
    expect(computeRefund(10000, 72)).toEqual({ refundCents: 10000, kind: "full" });
  });

  it("full refund exactly at the boundary", () => {
    expect(computeRefund(10000, 48)).toEqual({ refundCents: 10000, kind: "full" });
  });

  it("partial refund inside the window", () => {
    expect(computeRefund(10000, 24)).toEqual({ refundCents: 5000, kind: "partial" });
  });

  it("no refund once the rental has started", () => {
    expect(computeRefund(10000, -1)).toEqual({ refundCents: 0, kind: "none" });
  });

  it("no refund when nothing was paid", () => {
    expect(computeRefund(0, 72)).toEqual({ refundCents: 0, kind: "none" });
  });

  it("respects a custom policy", () => {
    const policy = { fullRefundHoursBefore: 24, partialRefundPercent: 25 };
    expect(computeRefund(10000, 10, policy)).toEqual({ refundCents: 2500, kind: "partial" });
    expect(DEFAULT_CANCELLATION_POLICY.fullRefundHoursBefore).toBe(48);
  });
});
