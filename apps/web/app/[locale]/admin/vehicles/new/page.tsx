import { Link } from "@/i18n/navigation";
import { VehicleFields } from "@/components/admin/vehicle-fields";
import { createVehicle } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/vehicles" className="text-sm text-muted hover:text-foreground">
          &larr; Vehicles
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Add vehicle</h1>
      </div>

      <form action={createVehicle} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <VehicleFields />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          Create vehicle
        </button>
      </form>
    </div>
  );
}
