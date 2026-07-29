"use server";

import { redirect } from "next/navigation";
import type { FuelType, Transmission, VehicleClass, VehicleStatus } from "@prisma/client";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

function euros(formData: FormData, name: string): number {
  return Math.round(Number(formData.get(name) ?? 0) * 100);
}

function int(formData: FormData, name: string): number {
  return Math.round(Number(formData.get(name) ?? 0));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readVehicleFields(formData: FormData) {
  return {
    name: String(formData.get("name")).trim(),
    make: String(formData.get("make")).trim(),
    model: String(formData.get("model")).trim(),
    year: int(formData, "year"),
    class: String(formData.get("class")) as VehicleClass,
    transmission: String(formData.get("transmission")) as Transmission,
    fuelType: String(formData.get("fuelType")) as FuelType,
    seats: int(formData, "seats"),
    doors: int(formData, "doors"),
    dailyRateCents: euros(formData, "daily"),
    weeklyRateCents: euros(formData, "weekly"),
    monthlyRateCents: euros(formData, "monthly"),
    depositCents: euros(formData, "deposit"),
    description: String(formData.get("description") ?? "").trim() || null,
    features: String(formData.get("features") ?? "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean),
    status: String(formData.get("status")) as VehicleStatus,
  };
}

export async function createVehicle(formData: FormData) {
  await assertAdmin();
  const locale = String(formData.get("locale") || "en");
  const fields = readVehicleFields(formData);

  let slug = slugify(fields.name);
  if (await prisma.vehicle.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await prisma.vehicle.create({ data: { ...fields, slug, photos: [] } });
  redirect(`/${locale}/admin/vehicles`);
}

export async function updateVehicle(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const locale = String(formData.get("locale") || "en");
  const fields = readVehicleFields(formData);
  await prisma.vehicle.update({ where: { id }, data: fields });
  redirect(`/${locale}/admin/vehicles`);
}

export async function setVehicleStatus(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as VehicleStatus;
  await prisma.vehicle.update({ where: { id }, data: { status } });
}

export async function addMaintenance(formData: FormData) {
  await assertAdmin();
  const vehicleId = String(formData.get("vehicleId"));
  const start = new Date(`${String(formData.get("startAt"))}T00:00:00`);
  const end = new Date(`${String(formData.get("endAt"))}T23:59:59`);
  if (end <= start) throw new Error("End must be after start");
  await prisma.maintenanceBlock.create({
    data: { vehicleId, startAt: start, endAt: end, reason: String(formData.get("reason") ?? "").trim() || null },
  });
}

export async function deleteMaintenance(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  await prisma.maintenanceBlock.delete({ where: { id } });
}
