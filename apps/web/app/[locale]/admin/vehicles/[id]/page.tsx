import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { VehicleFields } from "@/components/admin/vehicle-fields";
import { updateVehicle, addMaintenance, deleteMaintenance } from "../actions";

export const dynamic = "force-dynamic";

const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { maintenanceBlocks: { orderBy: { startAt: "asc" } } },
  });
  if (!vehicle) notFound();

  const { maintenanceBlocks, ...vehicleData } = vehicle;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/admin/vehicles" className="text-sm text-muted hover:text-foreground">
          &larr; Vehicles
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{vehicle.name}</h1>
        <p className="text-sm text-muted">/{vehicle.slug}</p>
      </div>

      <form action={updateVehicle} className="space-y-4">
        <input type="hidden" name="id" value={vehicle.id} />
        <input type="hidden" name="locale" value={locale} />
        <VehicleFields vehicle={vehicleData} />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          Save changes
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Maintenance blocks</h2>
        <p className="text-sm text-muted">
          Blocked dates make the vehicle unavailable for booking — availability is derived from these plus confirmed
          rentals.
        </p>

        {maintenanceBlocks.length > 0 ? (
          <ul className="space-y-2">
            {maintenanceBlocks.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                <span>
                  {formatDate(m.startAt, "en")} &rarr; {formatDate(m.endAt, "en")}
                  {m.reason ? <span className="text-muted"> — {m.reason}</span> : null}
                </span>
                <form action={deleteMaintenance}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="text-xs text-destructive hover:underline">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No maintenance blocks.</p>
        )}

        <form action={addMaintenance} className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-4">
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <label className="text-sm">
            <span className="mb-1 block text-muted">From</span>
            <input type="date" name="startAt" required className={field} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">To</span>
            <input type="date" name="endAt" required className={field} />
          </label>
          <label className="text-sm flex-1 min-w-[8rem]">
            <span className="mb-1 block text-muted">Reason</span>
            <input name="reason" placeholder="Service, repair…" className={field} />
          </label>
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add block
          </button>
        </form>
      </section>
    </div>
  );
}
