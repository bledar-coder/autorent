import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY);

type SeedVehicle = {
  slug: string;
  name: string;
  make: string;
  model: string;
  year: number;
  class: "economy" | "compact" | "sedan" | "suv" | "luxury" | "van";
  transmission: "manual" | "automatic";
  fuelType: "petrol" | "diesel" | "hybrid" | "electric";
  seats: number;
  doors: number;
  dailyRateCents: number;
  depositCents: number;
  features: string[];
};

const FEATURES = ["Air conditioning", "Bluetooth", "USB", "Cruise control"];

const VEHICLES: SeedVehicle[] = [
  { slug: "vw-golf-8", name: "Volkswagen Golf 8", make: "Volkswagen", model: "Golf", year: 2022, class: "compact", transmission: "manual", fuelType: "diesel", seats: 5, doors: 5, dailyRateCents: 3000, depositCents: 15000, features: FEATURES },
  { slug: "skoda-octavia", name: "Škoda Octavia", make: "Škoda", model: "Octavia", year: 2023, class: "sedan", transmission: "automatic", fuelType: "diesel", seats: 5, doors: 4, dailyRateCents: 4000, depositCents: 20000, features: [...FEATURES, "Parking sensors"] },
  { slug: "audi-a4", name: "Audi A4", make: "Audi", model: "A4", year: 2022, class: "sedan", transmission: "automatic", fuelType: "diesel", seats: 5, doors: 4, dailyRateCents: 5000, depositCents: 30000, features: [...FEATURES, "Leather seats", "Apple CarPlay"] },
  { slug: "bmw-320i", name: "BMW 320i", make: "BMW", model: "320i", year: 2021, class: "sedan", transmission: "automatic", fuelType: "petrol", seats: 5, doors: 4, dailyRateCents: 5500, depositCents: 30000, features: [...FEATURES, "Leather seats"] },
  { slug: "mercedes-c-class", name: "Mercedes-Benz C-Class", make: "Mercedes-Benz", model: "C-Class", year: 2023, class: "luxury", transmission: "automatic", fuelType: "diesel", seats: 5, doors: 4, dailyRateCents: 8000, depositCents: 50000, features: [...FEATURES, "Leather seats", "Ambient lighting"] },
  { slug: "vw-passat", name: "Volkswagen Passat", make: "Volkswagen", model: "Passat", year: 2022, class: "sedan", transmission: "automatic", fuelType: "diesel", seats: 5, doors: 4, dailyRateCents: 4500, depositCents: 25000, features: FEATURES },
  { slug: "toyota-corolla", name: "Toyota Corolla Hybrid", make: "Toyota", model: "Corolla", year: 2023, class: "compact", transmission: "automatic", fuelType: "hybrid", seats: 5, doors: 5, dailyRateCents: 3500, depositCents: 18000, features: [...FEATURES, "Lane assist"] },
  { slug: "dacia-duster", name: "Dacia Duster", make: "Dacia", model: "Duster", year: 2022, class: "suv", transmission: "manual", fuelType: "diesel", seats: 5, doors: 5, dailyRateCents: 4000, depositCents: 20000, features: FEATURES },
  { slug: "vw-tiguan", name: "Volkswagen Tiguan", make: "Volkswagen", model: "Tiguan", year: 2023, class: "suv", transmission: "automatic", fuelType: "diesel", seats: 5, doors: 5, dailyRateCents: 6000, depositCents: 35000, features: [...FEATURES, "Panoramic roof"] },
  { slug: "ford-transit", name: "Ford Transit", make: "Ford", model: "Transit", year: 2021, class: "van", transmission: "manual", fuelType: "diesel", seats: 9, doors: 4, dailyRateCents: 6000, depositCents: 30000, features: ["Air conditioning", "Bluetooth"] },
  { slug: "renault-clio", name: "Renault Clio", make: "Renault", model: "Clio", year: 2022, class: "economy", transmission: "manual", fuelType: "petrol", seats: 5, doors: 5, dailyRateCents: 2500, depositCents: 12000, features: ["Air conditioning", "Bluetooth", "USB"] },
  { slug: "tesla-model-3", name: "Tesla Model 3", make: "Tesla", model: "Model 3", year: 2023, class: "luxury", transmission: "automatic", fuelType: "electric", seats: 5, doors: 4, dailyRateCents: 9000, depositCents: 60000, features: [...FEATURES, "Autopilot", "Glass roof"] },
];

async function main() {
  // idempotent: clear domain data (child -> parent), keep upserting users
  await prisma.review.deleteMany();
  await prisma.conditionReport.deleteMany();
  await prisma.bookingExtension.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.maintenanceBlock.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.extra.deleteMany();
  await prisma.promoCode.deleteMany();

  const admin = await prisma.user.upsert({
    where: { email: "admin@autorent.test" },
    update: { role: "admin" },
    create: { name: "AutoRent Admin", email: "admin@autorent.test", role: "admin", emailVerified: true },
  });
  const arta = await prisma.user.upsert({
    where: { email: "arta@example.com" },
    update: {},
    create: { name: "Arta Krasniqi", email: "arta@example.com", phone: "+383 44 111 222" },
  });
  const besnik = await prisma.user.upsert({
    where: { email: "besnik@example.com" },
    update: {},
    create: { name: "Besnik Gashi", email: "besnik@example.com", phone: "+383 45 333 444" },
  });

  const vehicles: Awaited<ReturnType<typeof prisma.vehicle.create>>[] = [];
  for (const [i, v] of VEHICLES.entries()) {
    const vehicle = await prisma.vehicle.create({
      data: {
        ...v,
        weeklyRateCents: v.dailyRateCents * 6,
        monthlyRateCents: v.dailyRateCents * 24,
        description: `${v.name} — ${v.transmission}, ${v.fuelType}, ${v.seats} seats.`,
        photos: [`/vehicles/${v.slug}-1.jpg`, `/vehicles/${v.slug}-2.jpg`],
        documents: {
          create: [
            { type: "registration", expiresAt: daysFromNow(220 + i) },
            // one insurance + one service expire within 14 days to exercise the admin warning
            { type: "insurance", expiresAt: daysFromNow(i === 0 ? 9 : 130 + i) },
            { type: "service", expiresAt: daysFromNow(i === 1 ? 6 : 70 + i) },
          ],
        },
      },
    });
    vehicles.push(vehicle);
  }

  const extras = await Promise.all([
    prisma.extra.create({ data: { name: "Child seat", nameSq: "Ndenjëse për fëmijë", priceCents: 500, priceType: "per_day" } }),
    prisma.extra.create({ data: { name: "GPS", nameSq: "GPS", priceCents: 300, priceType: "per_day" } }),
    prisma.extra.create({ data: { name: "Additional driver", nameSq: "Shofer shtesë", priceCents: 700, priceType: "per_day" } }),
    prisma.extra.create({ data: { name: "Full insurance", nameSq: "Sigurim i plotë", priceCents: 1500, priceType: "per_day" } }),
    prisma.extra.create({ data: { name: "Airport delivery", nameSq: "Dorëzim në aeroport", priceCents: 2000, priceType: "flat" } }),
    prisma.extra.create({ data: { name: "Winter tires", nameSq: "Goma dimri", priceCents: 1000, priceType: "flat" } }),
  ]);

  await prisma.promoCode.createMany({
    data: [
      { code: "WELCOME10", kind: "percentage", amount: 10, validFrom: daysFromNow(-30), validUntil: daysFromNow(90), usageLimit: 100 },
      { code: "SUMMER25", kind: "fixed", amount: 2500, validFrom: daysFromNow(-10), validUntil: daysFromNow(60), usageLimit: 50 },
    ],
  });

  await prisma.maintenanceBlock.create({
    data: { vehicleId: vehicles[2]!.id, startAt: daysFromNow(3), endAt: daysFromNow(6), reason: "Scheduled service" },
  });

  const bookingFor = (
    ref: string,
    vehicleIndex: number,
    user: { id: string; name: string; email: string; phone: string | null },
    startOffset: number,
    days: number,
    status: "pending_payment" | "confirmed" | "active" | "completed" | "cancelled",
    source: "online" | "manual",
    paymentStatus: "unpaid" | "paid_offline" | "paid" | "refunded" | "partially_refunded",
    extra?: { holdExpiresAt?: Date },
  ) => {
    const vehicle = vehicles[vehicleIndex]!;
    const baseCents = vehicle.dailyRateCents * days;
    return prisma.booking.create({
      data: {
        reference: ref,
        vehicleId: vehicle.id,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone ?? "",
        startAt: daysFromNow(startOffset),
        endAt: daysFromNow(startOffset + days),
        status,
        source,
        paymentStatus,
        baseCents,
        totalCents: baseCents,
        holdExpiresAt: extra?.holdExpiresAt ?? null,
      },
    });
  };

  const completed = await bookingFor("AR-1001", 0, arta, -20, 4, "completed", "online", "paid");
  await bookingFor("AR-1002", 4, besnik, -1, 5, "active", "online", "paid");
  await bookingFor("AR-1003", 8, arta, 7, 3, "confirmed", "online", "paid");
  await bookingFor("AR-1004", 1, besnik, 14, 2, "pending_payment", "online", "unpaid", {
    holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
  await bookingFor("AR-1005", 10, arta, 21, 6, "confirmed", "manual", "paid_offline");

  await prisma.review.create({
    data: {
      bookingId: completed.id,
      vehicleId: vehicles[0]!.id,
      userId: arta.id,
      rating: 5,
      comment: "Great car and a smooth booking. Will rent again.",
      status: "approved",
    },
  });

  console.log(
    `Seed complete: ${vehicles.length} vehicles, ${extras.length} extras, 2 promo codes, 5 bookings, admin=${admin.email}`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
