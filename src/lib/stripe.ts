import Stripe from "stripe";

// Lazily constructed so pages that never touch checkout (browse, cart) don't
// fail at import time before STRIPE_SECRET_KEY is set.
let cachedStripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  cachedStripe = new Stripe(key);
  return cachedStripe;
}
