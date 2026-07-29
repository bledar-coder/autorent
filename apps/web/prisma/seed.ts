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

// Real model-matching photos from Wikimedia Commons (stable upload.wikimedia.org URLs).
const PHOTOS: Record<string, string[]> = {
  "vw-golf-8": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2020_Volkswagen_Golf_Style_1.5_Front.jpg/1280px-2020_Volkswagen_Golf_Style_1.5_Front.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/VOLKSWAGEN_GOLF_%28Mk8_CD1%29_China_%282%29.jpg/1280px-VOLKSWAGEN_GOLF_%28Mk8_CD1%29_China_%282%29.jpg",
  ],
  "skoda-octavia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/%C5%A0koda_Octavia_IV_Scout_IMG_7906.jpg/1280px-%C5%A0koda_Octavia_IV_Scout_IMG_7906.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/%C5%A0koda_Octavia_IV_Scout_IMG_7906a.jpg/1280px-%C5%A0koda_Octavia_IV_Scout_IMG_7906a.jpg",
  ],
  "audi-a4": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Audi_A4_B9_sedans_%28FL%29_1X7A6817.jpg/1280px-Audi_A4_B9_sedans_%28FL%29_1X7A6817.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Audi_A4_B9_sedans_%28FL%29_1X7A6816.jpg/1280px-Audi_A4_B9_sedans_%28FL%29_1X7A6816.jpg",
  ],
  "bmw-320i": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/BMW_3_SERIES_SEDAN_%28G20%29_China.jpg/1280px-BMW_3_SERIES_SEDAN_%28G20%29_China.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/BMW_3_SERIES_SEDAN_%28G20%29_China_%282%29.jpg/1280px-BMW_3_SERIES_SEDAN_%28G20%29_China_%282%29.jpg",
  ],
  "mercedes-c-class": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Mercedes-AMG_C_63_%28W206%29_IMG_0310.jpg/1280px-Mercedes-AMG_C_63_%28W206%29_IMG_0310.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Mercedes-AMG_C_63_%28W206%29_IMG_0305.jpg/1280px-Mercedes-AMG_C_63_%28W206%29_IMG_0305.jpg",
  ],
  "vw-passat": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Volkswagen_Passat_B8_%282019%29_IMG_1992.jpg/1280px-Volkswagen_Passat_B8_%282019%29_IMG_1992.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Volkswagen_Passat_Variant_R-Line%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0201%29.jpg/1280px-Volkswagen_Passat_Variant_R-Line%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0201%29.jpg",
  ],
  "toyota-corolla": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_7679.jpg/1280px-2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_7679.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2023_Toyota_Corolla_Hybrid_%28E210%29_hatchback_IMG_9877.jpg/1280px-2023_Toyota_Corolla_Hybrid_%28E210%29_hatchback_IMG_9877.jpg",
  ],
  "dacia-duster": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Dacia_Duster_II_Facelift_IAA_2021_1X7A0132.jpg/1280px-Dacia_Duster_II_Facelift_IAA_2021_1X7A0132.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Dacia_Duster%2C_GIMS_2024%2C_Le_Grand-Saconnex_%28GIMS0126%29.jpg/1280px-Dacia_Duster%2C_GIMS_2024%2C_Le_Grand-Saconnex_%28GIMS0126%29.jpg",
  ],
  "vw-tiguan": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Volkswagen_Tiguan_II_R-Line_China_2019-03-20.jpg/1280px-Volkswagen_Tiguan_II_R-Line_China_2019-03-20.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/2024_Volkswagen_Tiguan_4Motion_SE_R-Line_Black%2C_rear_left.jpg/1280px-2024_Volkswagen_Tiguan_4Motion_SE_R-Line_Black%2C_rear_left.jpg",
  ],
  "ford-transit": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Ford_Transit_Custom_%282023%29_1X7A1605.jpg/1280px-Ford_Transit_Custom_%282023%29_1X7A1605.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Ford_Transit_Custom_%282023%29_1X7A1608.jpg/1280px-Ford_Transit_Custom_%282023%29_1X7A1608.jpg",
  ],
  "renault-clio": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Renault_Clio_V_1X7A0392.jpg/1280px-Renault_Clio_V_1X7A0392.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Renault_Clio_V_%282023%29_1X7A1577.jpg/1280px-Renault_Clio_V_%282023%29_1X7A1577.jpg",
  ],
  "tesla-model-3": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Tesla_Model_3%2C_EMS_2024%2C_Essen_%28P1032260%29.jpg/1280px-Tesla_Model_3%2C_EMS_2024%2C_Essen_%28P1032260%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg/1280px-Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg",
  ],
};

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
        photos: PHOTOS[v.slug] ?? [],
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
