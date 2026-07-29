import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { createManualBooking } from "../actions";

export const dynamic = "force-dynamic";

const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

export default async function NewManualBooking({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, dailyRateCents: true },
  });

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/bookings" className="text-sm text-muted hover:text-foreground">
          &larr; Bookings
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Manual booking</h1>
        <p className="mt-1 text-sm text-muted">
          For walk-ins and phone bookings. The price is computed from the tiered rates; no online payment is taken.
        </p>
      </div>

      <form action={createManualBooking} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="block text-sm">
          <span className="mb-1 block text-muted">Vehicle</span>
          <select name="vehicleId" required className={field} defaultValue="">
            <option value="" disabled>
              Select a vehicle…
            </option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {formatPrice(v.dailyRateCents, "en")}/day
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Pick-up</span>
            <input type="date" name="startAt" required className={field} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Return</span>
            <input type="date" name="endAt" required className={field} />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-muted">Customer name</span>
          <input name="customerName" required className={field} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Email</span>
            <input name="customerEmail" type="email" required className={field} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Phone</span>
            <input name="customerPhone" required className={field} />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="markPaid" defaultChecked />
          <span>Mark as paid (cash / card in person)</span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          Create booking
        </button>
      </form>
    </div>
  );
}
