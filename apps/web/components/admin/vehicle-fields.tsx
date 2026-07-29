import type { Vehicle } from "@prisma/client";

const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

const CLASSES = ["economy", "compact", "sedan", "suv", "luxury", "van"];
const TRANSMISSIONS = ["manual", "automatic"];
const FUELS = ["petrol", "diesel", "hybrid", "electric"];

function euro(cents: number | undefined): string {
  return cents === undefined ? "" : String(cents / 100);
}

/** Vehicle form fields. Money inputs are in euros; the server action converts to cents. */
export function VehicleFields({ vehicle }: { vehicle?: Vehicle }) {
  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Display name</span>
        <input name="name" required defaultValue={vehicle?.name} className={field} />
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Make</span>
          <input name="make" required defaultValue={vehicle?.make} className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Model</span>
          <input name="model" required defaultValue={vehicle?.model} className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Year</span>
          <input name="year" type="number" required defaultValue={vehicle?.year} className={field} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Class</span>
          <select name="class" defaultValue={vehicle?.class ?? "economy"} className={`${field} capitalize`}>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Transmission</span>
          <select
            name="transmission"
            defaultValue={vehicle?.transmission ?? "manual"}
            className={`${field} capitalize`}
          >
            {TRANSMISSIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Fuel</span>
          <select name="fuelType" defaultValue={vehicle?.fuelType ?? "petrol"} className={`${field} capitalize`}>
            {FUELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Seats</span>
          <input name="seats" type="number" required defaultValue={vehicle?.seats ?? 5} className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Doors</span>
          <input name="doors" type="number" required defaultValue={vehicle?.doors ?? 4} className={field} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Daily €</span>
          <input name="daily" type="number" step="0.01" required defaultValue={euro(vehicle?.dailyRateCents)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Weekly €</span>
          <input name="weekly" type="number" step="0.01" required defaultValue={euro(vehicle?.weeklyRateCents)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Monthly €</span>
          <input name="monthly" type="number" step="0.01" required defaultValue={euro(vehicle?.monthlyRateCents)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Deposit €</span>
          <input name="deposit" type="number" step="0.01" defaultValue={euro(vehicle?.depositCents ?? 0)} className={field} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-muted">Description</span>
        <textarea name="description" rows={3} defaultValue={vehicle?.description ?? ""} className={field} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-muted">Features (comma-separated)</span>
        <input name="features" defaultValue={vehicle?.features.join(", ")} className={field} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-muted">Photos (one image URL per line)</span>
        <textarea
          name="photos"
          rows={3}
          defaultValue={vehicle?.photos.join("\n")}
          placeholder="https://…/car.jpg"
          className={field}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-muted">Status</span>
        <select name="status" defaultValue={vehicle?.status ?? "active"} className={`${field} capitalize`}>
          <option value="active">active</option>
          <option value="retired">retired</option>
        </select>
      </label>
    </div>
  );
}
