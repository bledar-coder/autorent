import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://autorent-ks.vercel.app";
const LOCALES = ["sq", "en"];
const PAGES = ["", "/fleet", "/availability", "/about", "/contact", "/faq", "/terms", "/login", "/register"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs: string[] = [];
  try {
    const vehicles = await prisma.vehicle.findMany({ where: { status: "active" }, select: { slug: true } });
    slugs = vehicles.map((v) => v.slug);
  } catch {
    // build must not depend on the database being reachable
  }

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const page of PAGES) {
      entries.push({
        url: `${APP_URL}/${locale}${page}`,
        changeFrequency: "weekly",
        priority: page === "" ? 1 : 0.7,
      });
    }
    for (const slug of slugs) {
      entries.push({ url: `${APP_URL}/${locale}/fleet/${slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }
  return entries;
}
