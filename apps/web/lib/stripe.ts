import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily-constructed server Stripe client (so builds without the key don't throw). */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}
