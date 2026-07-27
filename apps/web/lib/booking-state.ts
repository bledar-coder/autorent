import type { BookingStatus } from "@autorent/schemas";

/**
 * Booking lifecycle state machine — the single place valid transitions are
 * enforced. A booking only becomes `confirmed` via a successful payment
 * (webhook), never client-driven; this module just guards the moves.
 *
 *   pending_payment ─▶ confirmed ─▶ active ─▶ completed
 *          │                │
 *          └────▶ cancelled ◀┘
 */
const TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
};

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: BookingStatus,
    readonly to: BookingStatus,
  ) {
    super(`Invalid booking transition: ${from} -> ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function nextStates(from: BookingStatus): readonly BookingStatus[] {
  return TRANSITIONS[from];
}

export function isTerminal(status: BookingStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
