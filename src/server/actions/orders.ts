"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getCurrentFarmId } from "@/lib/farm-context";
import { createOrderSchema, orderLookupSchema, type CreateOrderInput, type OrderLookupInput } from "@/schemas/order";

async function siteOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}

// Prices and product names are re-read from the DB here, never trusted from
// the client cart — a stale or tampered client-side price must never become
// what a customer is actually charged.
export async function createOrder(input: CreateOrderInput) {
  const data = createOrderSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const products = await db.product.findMany({
    where: { farmId, id: { in: data.items.map((i) => i.productId) }, publicVisible: true, active: true },
  });
  if (products.length !== data.items.length) {
    throw new Error("One or more items are no longer available.");
  }

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (product.stockOnHand != null && item.quantity > product.stockOnHand) {
      throw new Error(`Only ${product.stockOnHand} of "${product.name}" left in stock.`);
    }
  }

  const customer = await db.customer.upsert({
    where: { farmId_email: { farmId, email: data.customer.email } },
    update: { name: data.customer.name, phone: data.customer.phone },
    create: { farmId, email: data.customer.email, name: data.customer.name, phone: data.customer.phone },
  });

  const lineItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = product.price ?? 0;
    return {
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    };
  });
  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);

  const order = await db.order.create({
    data: {
      farmId,
      customerId: customer.id,
      status: "PENDING",
      subtotal,
      total: subtotal,
      fulfilmentNote: data.customer.note,
      items: { create: lineItems },
    },
    include: { items: true },
  });

  return order;
}

export async function createCheckoutSession(orderId: string) {
  const farmId = await getCurrentFarmId();
  const order = await db.order.findFirstOrThrow({ where: { id: orderId, farmId }, include: { items: true } });
  const origin = await siteOrigin();

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: (await db.customer.findUniqueOrThrow({ where: { id: order.customerId } })).email,
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: order.currency,
        unit_amount: Math.round(item.unitPrice * 100),
        product_data: { name: item.productName },
      },
    })),
    success_url: `${origin}/store/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/store/checkout?order=${order.id}`,
    metadata: { orderId: order.id },
  });

  await db.order.update({ where: { id: order.id }, data: { stripeCheckoutSessionId: session.id } });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

export async function getOrderBySessionId(sessionId: string) {
  const farmId = await getCurrentFarmId();
  return db.order.findFirst({
    where: { farmId, stripeCheckoutSessionId: sessionId },
    select: {
      id: true,
      status: true,
      subtotal: true,
      total: true,
      currency: true,
      createdAt: true,
      customer: { select: { name: true, email: true } },
      items: { select: { productName: true, unitPrice: true, quantity: true, lineTotal: true } },
    },
  });
}

export async function getOrderForLookup(input: OrderLookupInput) {
  const data = orderLookupSchema.parse(input);
  const farmId = await getCurrentFarmId();
  return db.order.findFirst({
    where: { farmId, id: data.orderId, customer: { email: data.email } },
    select: {
      id: true,
      status: true,
      subtotal: true,
      total: true,
      currency: true,
      createdAt: true,
      items: { select: { productName: true, unitPrice: true, quantity: true, lineTotal: true } },
    },
  });
}

export async function listOrders() {
  const farmId = await getCurrentFarmId();
  return db.order.findMany({
    where: { farmId },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrder(id: string) {
  const farmId = await getCurrentFarmId();
  return db.order.findFirstOrThrow({
    where: { id, farmId },
    include: { customer: true, items: { include: { product: true } } },
  });
}

export async function markOrderFulfilled(id: string) {
  const farmId = await getCurrentFarmId();
  await db.order.updateMany({ where: { id, farmId }, data: { status: "FULFILLED" } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}
