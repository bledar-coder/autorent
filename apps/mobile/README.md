# @autorent/mobile

AutoRent's customer app — Expo (SDK 52) + Expo Router. It consumes the shared
`/api/v1` backend and `@autorent/tokens`/`@autorent/api-client`, never
reimplementing business rules. Booking uses the Stripe Payment Sheet, driven by
the `clientSecret` the backend returns from `POST /api/v1/bookings`.

## Screens

- **Fleet** (`app/index.tsx`) — live vehicle list with pull-to-refresh
- **Vehicle** (`app/vehicle/[slug].tsx`) — specs, tiered pricing, reviews
- **Book** (`app/book/[slug].tsx`) — dates + details → Stripe Payment Sheet

## Running it

From the repo root:

```bash
pnpm install                 # installs the Expo/RN deps (first time only)
pnpm --filter @autorent/mobile dev
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR with
Expo Go. Stripe's native Payment Sheet needs a **development build** or a real
device — it does not run in the web preview.

## Environment variables

Create `apps/mobile/.env` (all `EXPO_PUBLIC_` vars are inlined at build time):

```
EXPO_PUBLIC_API_URL=https://autorent-web-nine.vercel.app
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

- For local API testing, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP
  (e.g. `http://192.168.1.20:3000`) so a phone on the same network can reach the
  dev server — `localhost` points at the phone itself.
- Use the same Stripe **test** publishable key as the web app.
