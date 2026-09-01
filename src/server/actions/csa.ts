"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getCurrentFarmId } from "@/lib/farm-context";
import { createCSASubscriptionSchema, billingPortalLookupSchema, type CreateCSASubscriptionInput, type BillingPortalLookupInput } from "@/schemas/csa";

async function siteOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}

export async function createCSASubscriptionCheckout(input: CreateCSASubscriptionInput) {
  const data = createCSASubscriptionSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const product = await db.product.findFirstOrThrow({
    where: { id: data.productId, farmId, publicVisible: true, active: true, isSubscription: true },
  });

  const customer = await db.customer.upsert({
    where: { farmId_email: { farmId, email: data.customer.email } },
    update: { name: data.customer.name, phone: data.customer.phone },
    create: { farmId, email: data.customer.email, name: data.customer.name, phone: data.customer.phone },
  });

  const stripe = getStripe();
  let stripeCustomerId = customer.stripeCustomerId;
  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({ email: customer.email, name: customer.name });
    stripeCustomerId = stripeCustomer.id;
    await db.customer.update({ where: { id: customer.id }, data: { stripeCustomerId } });
  }

  const origin = await siteOrigin();
  const intervalCount = data.frequency === "FORTNIGHTLY" ? 2 : 1;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "aud",
          unit_amount: Math.round((product.price ?? 0) * 100),
          recurring: { interval: "week", interval_count: intervalCount },
          product_data: { name: product.name },
        },
      },
    ],
    success_url: `${origin}/store/csa/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/store/${product.id}`,
    metadata: { customerId: customer.id, productId: product.id, frequency: data.frequency },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

export async function getBillingPortalUrl(input: BillingPortalLookupInput) {
  const data = billingPortalLookupSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const customer = await db.customer.findUnique({ where: { farmId_email: { farmId, email: data.email } } });
  if (!customer?.stripeCustomerId) return null;

  const origin = await siteOrigin();
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: `${origin}/store`,
  });
  return session.url;
}

export async function getCSASubscriptionBySessionId(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const farmId = await getCurrentFarmId();
  if (typeof session.subscription !== "string") return null;
  return db.cSASubscription.findFirst({
    where: { farmId, stripeSubscriptionId: session.subscription },
    select: { id: true, frequency: true, status: true, product: { select: { name: true, price: true } } },
  });
}

export async function listCSASubscriptions() {
  const farmId = await getCurrentFarmId();
  return db.cSASubscription.findMany({
    where: { farmId },
    include: { customer: true, product: true },
    orderBy: { createdAt: "desc" },
  });
}
