"use server";

import type { ReviewStatus } from "@prisma/client";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function moderateReview(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ReviewStatus;
  await prisma.review.update({ where: { id }, data: { status } });
}
