import type { Vehicle } from "@prisma/client";
import { Users, Gauge, Fuel } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatVehicleClass, titleCase } from "@/lib/format";

export function VehicleCard({
  vehicle,
  locale,
  perDayLabel,
}: {
  vehicle: Vehicle;
  locale: string;
  perDayLabel: string;
}) {
  return (
    <Link
      href={`/fleet/${vehicle.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-transform duration-200 hover:-translate-y-1 hover:border-primary"
    >
      <div className="flex aspect-video items-center justify-center bg-surface-elevated text-muted">
        <span className="text-sm">{formatVehicleClass(vehicle.class)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
          <p className="text-sm text-muted">
            {vehicle.year} &middot; {formatVehicleClass(vehicle.class)}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" /> {vehicle.seats}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-4 w-4" /> {titleCase(vehicle.transmission)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-4 w-4" /> {titleCase(vehicle.fuelType)}
          </span>
        </div>
        <div className="mt-auto">
          <span className="text-xl font-semibold text-foreground">
            {formatPrice(vehicle.dailyRateCents, locale)}
          </span>
          <span className="text-sm text-muted"> {perDayLabel}</span>
        </div>
      </div>
    </Link>
  );
}
