import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { reviewCreateSchema } from "@autorent/schemas";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Sign in required" } }, { status: 401 });
  }

  const parsed = reviewCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "invalid", message: "Invalid review" } }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id }, include: { review: true } });
  if (!booking) {
    return NextResponse.json({ error: { code: "not_found", message: "Booking not found" } }, { status: 404 });
  }
  if (booking.userId !== session.user.id) {
    return NextResponse.json({ error: { code: "forbidden", message: "Not allowed" } }, { status: 403 });
  }
  if (booking.status !== "completed") {
    return NextResponse.json(
      { error: { code: "not_reviewable", message: "Only completed rentals can be reviewed" } },
      { status: 409 },
    );
  }
  if (booking.review) {
    return NextResponse.json({ error: { code: "already_reviewed", message: "Already reviewed" } }, { status: 409 });
  }

  // Reviews start pending and appear on the vehicle only after admin approval.
  await prisma.review.create({
    data: {
      bookingId: booking.id,
      vehicleId: booking.vehicleId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true });
}
