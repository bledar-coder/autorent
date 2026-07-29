import type { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUSES: (BookingStatus | "all")[] = [
  "all",
  "pending_payment",
  "confirmed",
  "active",
  "completed",
  "cancelled",
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = STATUSES.includes(status as BookingStatus) ? (status as BookingStatus) : "all";

  const bookings = await prisma.booking.findMany({
    where: active === "all" ? {} : { status: active },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { vehicle: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <Link
          href="/admin/bookings/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          + Manual booking
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/bookings" : `/admin/bookings?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              active === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-muted">No bookings.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Reference</th>
                <th className="px-4 py-2 font-medium">Vehicle</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Dates</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium text-primary hover:underline">
                      {b.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{b.vehicle.name}</td>
                  <td className="px-4 py-2">{b.customerName}</td>
                  <td className="px-4 py-2 text-muted">
                    {formatDate(b.startAt, "en")} &rarr; {formatDate(b.endAt, "en")}
                  </td>
                  <td className="px-4 py-2">{formatPrice(b.totalCents, "en")}</td>
                  <td className="px-4 py-2 capitalize text-muted">{b.source}</td>
                  <td className="px-4 py-2 capitalize">{b.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
