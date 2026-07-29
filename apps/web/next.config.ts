import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@autorent/tokens", "@autorent/schemas", "@autorent/i18n"],
  images: {
    // Vehicle photos are external URLs (seed uses Pexels; admins can paste any https URL).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default withNextIntl(nextConfig);
