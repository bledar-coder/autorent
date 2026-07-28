import { NextResponse, type NextRequest } from "next/server";
import { bookingCreateSchema } from "@autorent/schemas";
import { createBooking, BookingError } from "@/lib/services/booking";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Invalid request body" } },
      { status: 400 },
    );
  }

  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });

  try {
    const { booking, clientSecret } = await createBooking({
      ...parsed.data,
      userId: session?.user?.id ?? null,
    });
    return NextResponse.json({
      reference: booking.reference,
      bookingId: booking.id,
      clientSecret,
      totalCents: booking.totalCents,
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 409 });
    }
    console.error("booking creation failed", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Booking failed" } },
      { status: 500 },
    );
  }
}
