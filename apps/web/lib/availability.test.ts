import { describe, it, expect } from "vitest";
import { rangesOverlap, isRangeFree, isVehicleAvailable, type BookingLike } from "./availability";

const d = (iso: string) => new Date(iso);
const range = (start: string, end: string) => ({ start: d(start), end: d(end) });

describe("rangesOverlap", () => {
  it("detects an overlap", () => {
    expect(rangesOverlap(range("2026-08-01", "2026-08-05"), range("2026-08-03", "2026-08-07"))).toBe(true);
  });

  it("allows back-to-back ranges (half-open)", () => {
    expect(rangesOverlap(range("2026-08-01", "2026-08-05"), range("2026-08-05", "2026-08-09"))).toBe(false);
  });

  it("detects containment", () => {
    expect(rangesOverlap(range("2026-08-01", "2026-08-10"), range("2026-08-03", "2026-08-04"))).toBe(true);
  });
});

describe("isVehicleAvailable", () => {
  const now = d("2026-07-20T12:00:00Z");
  const requested = range("2026-08-01", "2026-08-05");

  it("is free with no bookings or maintenance", () => {
    expect(isVehicleAvailable(requested, [], [], now)).toBe(true);
  });

  it("is blocked by a confirmed overlapping booking", () => {
    const bookings: BookingLike[] = [{ ...range("2026-08-03", "2026-08-06"), status: "confirmed" }];
    expect(isVehicleAvailable(requested, bookings, [], now)).toBe(false);
  });

  it("ignores cancelled and completed bookings", () => {
    const bookings: BookingLike[] = [
      { ...range("2026-08-02", "2026-08-04"), status: "cancelled" },
      { ...range("2026-08-02", "2026-08-04"), status: "completed" },
    ];
    expect(isVehicleAvailable(requested, bookings, [], now)).toBe(true);
  });

  it("is blocked by a pending booking whose hold has not expired", () => {
    const bookings: BookingLike[] = [
      { ...range("2026-08-02", "2026-08-04"), status: "pending_payment", holdExpiresAt: d("2026-07-20T12:15:00Z") },
    ];
    expect(isVehicleAvailable(requested, bookings, [], now)).toBe(false);
  });

  it("ignores a pending booking whose hold has expired", () => {
    const bookings: BookingLike[] = [
      { ...range("2026-08-02", "2026-08-04"), status: "pending_payment", holdExpiresAt: d("2026-07-20T11:45:00Z") },
    ];
    expect(isVehicleAvailable(requested, bookings, [], now)).toBe(true);
  });

  it("is blocked by a maintenance window", () => {
    expect(isVehicleAvailable(requested, [], [range("2026-08-04", "2026-08-10")], now)).toBe(false);
  });

  it("rejects an invalid requested range", () => {
    expect(() => isRangeFree(range("2026-08-05", "2026-08-01"), [])).toThrow();
  });
});
