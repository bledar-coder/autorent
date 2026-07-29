import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// On Vercel, derive the auth URL from the live deployment so a renamed domain
// never breaks sign-in; locally, BETTER_AUTH_URL (e.g. http://localhost:3000)
// applies. trustedOrigins covers the production alias and preview deployments.
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
const deploymentUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const baseURL = productionUrl ?? process.env.BETTER_AUTH_URL;
const trustedOrigins = Array.from(
  new Set(
    [baseURL, productionUrl, deploymentUrl, process.env.BETTER_AUTH_URL].filter(Boolean) as string[],
  ),
);

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {},
  user: {
    additionalFields: {
      // roles: customer (default) | admin. Never client-settable.
      role: { type: "string", defaultValue: "customer", input: false },
      phone: { type: "string", required: false },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
