import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { setVehicleStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminVehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
        <Link
          href="/admin/vehicles/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          + Add vehicle
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Class</th>
              <th className="px-4 py-2 font-medium">Daily</th>
              <th className="px-4 py-2 font-medium">Bookings</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t border-border">
                <td className="px-4 py-2">
                  <Link href={`/admin/vehicles/${v.id}`} className="font-medium text-primary hover:underline">
                    {v.name}
                  </Link>
                </td>
                <td className="px-4 py-2 capitalize text-muted">{v.class}</td>
                <td className="px-4 py-2">{formatPrice(v.dailyRateCents, "en")}</td>
                <td className="px-4 py-2 text-muted">{v._count.bookings}</td>
                <td className="px-4 py-2 capitalize">
                  <span className={v.status === "active" ? "text-success" : "text-muted"}>{v.status}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <form action={setVehicleStatus}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="status" value={v.status === "active" ? "retired" : "active"} />
                    <button type="submit" className="text-xs text-muted hover:text-foreground">
                      {v.status === "active" ? "Retire" : "Reactivate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
