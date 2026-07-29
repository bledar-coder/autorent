import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const [pendingPayment, confirmed, active, pendingReviews, activeVehicles, inMaintenance, revenue] =
    await Promise.all([
      prisma.booking.count({ where: { status: "pending_payment" } }),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.booking.count({ where: { status: "active" } }),
      prisma.review.count({ where: { status: "pending" } }),
      prisma.vehicle.count({ where: { status: "active" } }),
      prisma.maintenanceBlock.count({ where: { startAt: { lte: now }, endAt: { gt: now } } }),
      prisma.booking.aggregate({
        _sum: { totalCents: true },
        where: { paymentStatus: { in: ["paid", "paid_offline"] } },
      }),
    ]);
  return {
    pendingPayment,
    confirmed,
    active,
    pendingReviews,
    activeVehicles,
    inMaintenance,
    revenueCents: revenue._sum.totalCents ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const upcoming = await prisma.booking.findMany({
    where: { status: { in: ["confirmed", "active"] }, endAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
    take: 8,
    include: { vehicle: { select: { name: true } } },
  });

  const cards = [
    { label: "Revenue collected", value: formatPrice(stats.revenueCents, "en"), accent: true },
    { label: "Active rentals", value: stats.active },
    { label: "Upcoming (confirmed)", value: stats.confirmed },
    { label: "Awaiting payment", value: stats.pendingPayment },
    { label: "Pending reviews", value: stats.pendingReviews, href: "/admin/reviews" },
    { label: "Active vehicles", value: stats.activeVehicles, href: "/admin/vehicles" },
    { label: "In maintenance now", value: stats.inMaintenance },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <div
              className={`rounded-xl border p-5 ${
                c.accent ? "border-primary/40 bg-primary/5" : "border-border bg-surface"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
              <p className="mt-2 text-2xl font-bold">{c.value}</p>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="transition-opacity hover:opacity-80">
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming &amp; active rentals</h2>
          <Link href="/admin/bookings" className="text-sm text-primary hover:underline">
            All bookings &rarr;
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-6 text-muted">Nothing upcoming.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Reference</th>
                  <th className="px-4 py-2 font-medium">Vehicle</th>
                  <th className="px-4 py-2 font-medium">Customer</th>
                  <th className="px-4 py-2 font-medium">Dates</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((b) => (
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
                    <td className="px-4 py-2 capitalize">{b.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
