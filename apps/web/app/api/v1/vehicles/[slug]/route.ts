import { NextResponse } from "next/server";
import { getVehicleBySlug } from "@/lib/queries/vehicles";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Vehicle not found" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ vehicle });
}
