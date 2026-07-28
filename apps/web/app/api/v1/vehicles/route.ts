import { NextResponse, type NextRequest } from "next/server";
import { vehicleClassSchema, transmissionSchema } from "@autorent/schemas";
import { getVehicles } from "@/lib/queries/vehicles";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const parsedClass = vehicleClassSchema.safeParse(sp.get("class"));
  const parsedTrans = transmissionSchema.safeParse(sp.get("transmission"));
  const seats = Number(sp.get("seats"));
  const maxPrice = Number(sp.get("maxPrice"));
  const fromStr = sp.get("from");
  const toStr = sp.get("to");
  const from = fromStr ? new Date(fromStr) : undefined;
  const to = toStr ? new Date(toStr) : undefined;
  const range =
    from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && to > from
      ? { start: from, end: to }
      : undefined;

  try {
    const vehicles = await getVehicles({
      vehicleClass: parsedClass.success ? parsedClass.data : undefined,
      transmission: parsedTrans.success ? parsedTrans.data : undefined,
      minSeats: Number.isFinite(seats) && seats > 0 ? seats : undefined,
      maxPriceCents: Number.isFinite(maxPrice) && maxPrice > 0 ? Math.round(maxPrice) * 100 : undefined,
      range,
    });
    return NextResponse.json({ vehicles });
  } catch {
    return NextResponse.json(
      { error: { code: "internal_error", message: "Failed to load vehicles" } },
      { status: 500 },
    );
  }
}
