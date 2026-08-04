import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://autorent-ks.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/sq/admin", "/en/admin", "/api"] },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
