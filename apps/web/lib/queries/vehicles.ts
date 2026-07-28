import type { Prisma, Vehicle } from "@prisma/client";
import type { VehicleClass, Transmission } from "@autorent/schemas";
import { prisma } from "@/lib/db";
import { isVehicleAvailable, type BookingLike, type DateRange } from "@/lib/availability";

// bookings in these states hold a vehicle; completed/cancelled do not
const HOLDING_STATUSES = ["pending_payment", "confirmed", "active"] as const;

export interface VehicleFilters {
  vehicleClass?: VehicleClass;
  transmission?: Transmission;
  minSeats?: number;
  maxPriceCents?: number;
  range?: DateRange;
}

/**
 * List active vehicles matching the filters. When a date range is given, only
 * vehicles that are free for the whole range are returned — computed through the
 * same availability engine the booking flow uses.
 */
export async function getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  const where: Prisma.VehicleWhereInput = { status: "active" };
  if (filters.vehicleClass) where.class = filters.vehicleClass;
  if (filters.transmission) where.transmission = filters.transmission;
  if (filters.minSeats) where.seats = { gte: filters.minSeats };
  if (filters.maxPriceCents) where.dailyRateCents = { lte: filters.maxPriceCents };

  if (!filters.range) {
    return prisma.vehicle.findMany({ where, orderBy: { dailyRateCents: "asc" } });
  }

  const rows = await prisma.vehicle.findMany({
    where,
    orderBy: { dailyRateCents: "asc" },
    include: {
      bookings: {
        where: { status: { in: [...HOLDING_STATUSES] } },
        select: { startAt: true, endAt: true, status: true, holdExpiresAt: true },
      },
      maintenanceBlocks: { select: { startAt: true, endAt: true } },
    },
  });

  const now = new Date();
  const range = filters.range;

  return rows
    .filter((v) => {
      const bookings: BookingLike[] = v.bookings.map((b) => ({
        start: b.startAt,
        end: b.endAt,
        status: b.status,
        holdExpiresAt: b.holdExpiresAt,
      }));
      const maintenance: DateRange[] = v.maintenanceBlocks.map((m) => ({
        start: m.startAt,
        end: m.endAt,
      }));
      return isVehicleAvailable(range, bookings, maintenance, now);
    })
    .map(({ bookings: _b, maintenanceBlocks: _m, ...vehicle }) => vehicle);
}

export async function getFeaturedVehicles(limit = 3): Promise<Vehicle[]> {
  return prisma.vehicle.findMany({
    where: { status: "active" },
    orderBy: { dailyRateCents: "desc" },
    take: limit,
  });
}

export async function getVehicleBySlug(slug: string) {
  return prisma.vehicle.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}
