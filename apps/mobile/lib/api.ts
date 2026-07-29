import { createApiClient } from "@autorent/api-client";

// Point at your deployment; override with EXPO_PUBLIC_API_URL for local dev
// (use your machine's LAN IP, e.g. http://192.168.1.20:3000, so a device can reach it).
const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "https://autorent-ks.vercel.app";

export const api = createApiClient({ baseUrl });
