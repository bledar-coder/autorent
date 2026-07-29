import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ count: 0 });
  const count = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });
  return NextResponse.json({ count });
}
