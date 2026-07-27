import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  isTerminal,
  nextStates,
  InvalidTransitionError,
} from "./booking-state";

describe("booking state machine", () => {
  it("allows the happy path", () => {
    expect(canTransition("pending_payment", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "active")).toBe(true);
    expect(canTransition("active", "completed")).toBe(true);
  });

  it("allows cancelling before pickup", () => {
    expect(canTransition("pending_payment", "cancelled")).toBe(true);
    expect(canTransition("confirmed", "cancelled")).toBe(true);
  });

  it("rejects skipping states", () => {
    expect(canTransition("pending_payment", "active")).toBe(false);
    expect(canTransition("confirmed", "completed")).toBe(false);
    expect(canTransition("active", "cancelled")).toBe(false);
  });

  it("treats completed and cancelled as terminal", () => {
    expect(isTerminal("completed")).toBe(true);
    expect(isTerminal("cancelled")).toBe(true);
    expect(nextStates("completed")).toEqual([]);
    expect(canTransition("completed", "active")).toBe(false);
  });

  it("throws a typed error on an invalid transition", () => {
    expect(() => assertTransition("completed", "active")).toThrow(InvalidTransitionError);
    expect(() => assertTransition("pending_payment", "confirmed")).not.toThrow();
  });
});
