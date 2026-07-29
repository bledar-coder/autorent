import Image from "next/image";
import { Car } from "lucide-react";
import { formatVehicleClass } from "@/lib/format";

/**
 * Renders a vehicle photo, falling back to a branded gradient placeholder when
 * no image is set — so the catalog looks intentional either way.
 */
export function VehiclePhoto({
  src,
  alt,
  vehicleClass,
  className,
  sizes = "(max-width: 768px) 100vw, 400px",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  vehicleClass: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-surface-elevated ${className ?? ""}`}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-surface-elevated via-surface to-background ${className ?? ""}`}
    >
      <div className="flex flex-col items-center gap-2 text-muted">
        <Car className="h-10 w-10 opacity-40" />
        <span className="text-sm">{formatVehicleClass(vehicleClass)}</span>
      </div>
    </div>
  );
}
