import { notFound } from "next/navigation";
import type { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatDate } from "@/lib/format";
import { nextStates } from "@/lib/booking-state";
import { updateBookingStatus, extendBooking } from "../actions";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<BookingStatus, string> = {
  pending_payment: "Revert to pending",
  confirmed: "Confirm (mark paid)",
  active: "Start rental",
  completed: "Complete (returned)",
  cancelled: "Cancel booking",
};

export default async function AdminBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      vehicle: { select: { name: true, slug: true } },
      extensions: { orderBy: { createdAt: "asc" } },
      review: true,
    },
  });
  if (!booking) notFound();

  const transitions = nextStates(booking.status);
  const canExtend = booking.status === "confirmed" || booking.status === "active";

  const rows: [string, string][] = [
    ["Reference", booking.reference],
    ["Vehicle", booking.vehicle.name],
    ["Customer", booking.customerName],
    ["Email", booking.customerEmail],
    ["Phone", booking.customerPhone],
    ["Pick-up", formatDate(booking.startAt, "en")],
    ["Return", formatDate(booking.endAt, "en")],
    ["Source", booking.source],
    ["Payment", booking.paymentStatus.replace("_", " ")],
    ["Status", booking.status.replace("_", " ")],
  ];
  if (booking.refundCents > 0) rows.push(["Refunded", formatPrice(booking.refundCents, "en")]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/admin/bookings" className="text-sm text-muted hover:text-foreground">
          &larr; Bookings
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{booking.reference}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <dl className="rounded-xl border border-border bg-surface p-5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border/50 py-1.5 last:border-0">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right capitalize">{v}</dd>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="capitalize">{formatPrice(booking.totalCents, "en")}</span>
          </div>
        </dl>

        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold">Actions</h2>
            {transitions.length === 0 ? (
              <p className="text-sm text-muted">This booking is in a final state.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {transitions.map((target) => (
                  <form key={target} action={updateBookingStatus}>
                    <input type="hidden" name="id" value={booking.id} />
                    <input type="hidden" name="target" value={target} />
                    <button
                      type="submit"
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        target === "cancelled"
                          ? "border border-destructive text-destructive hover:bg-destructive/10"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      {ACTION_LABEL[target]}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </section>

          {canExtend ? (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold">Extend rental</h2>
              <form action={extendBooking} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={booking.id} />
                <label className="text-sm">
                  <span className="mb-1 block text-muted">New return date</span>
                  <input
                    type="date"
                    name="newEnd"
                    required
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Extend
                </button>
              </form>
              <p className="mt-2 text-xs text-muted">
                The difference is priced with tier discounts and collected on pick-up.
              </p>
            </section>
          ) : null}
        </div>
      </div>

      {booking.extensions.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Extensions</h2>
          <ul className="space-y-1 text-sm text-muted">
            {booking.extensions.map((e) => (
              <li key={e.id} className="rounded-md border border-border bg-surface px-3 py-2">
                +{e.addedDays} day(s) to {formatDate(e.newEndAt, "en")} — {formatPrice(e.priceCents, "en")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
