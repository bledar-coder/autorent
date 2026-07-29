import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@autorent/tokens", "@autorent/schemas", "@autorent/i18n"],
};

export default withNextIntl(nextConfig);
