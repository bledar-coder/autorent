"use server";

import type { PromoKind } from "@prisma/client";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function createPromo(formData: FormData) {
  await assertAdmin();
  const code = String(formData.get("code")).trim().toUpperCase();
  const kind = String(formData.get("kind")) as PromoKind;
  const rawAmount = Number(formData.get("amount") ?? 0);
  // percentage stores a whole percent; fixed stores euro cents
  const amount = kind === "percentage" ? Math.round(rawAmount) : Math.round(rawAmount * 100);
  const validFrom = new Date(`${String(formData.get("validFrom"))}T00:00:00`);
  const validUntil = new Date(`${String(formData.get("validUntil"))}T23:59:59`);
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();
  const usageLimit = usageLimitRaw ? Math.round(Number(usageLimitRaw)) : null;

  if (!code || !amount) throw new Error("Code and amount are required");

  await prisma.promoCode.create({
    data: { code, kind, amount, validFrom, validUntil, usageLimit, active: true },
  });
}

export async function togglePromo(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.promoCode.update({ where: { id }, data: { active } });
}
