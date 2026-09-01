import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// checkout.session.completed handles both one-time order payments (mode
// "payment") and the first CSA subscription payment (mode "subscription");
// customer.subscription.deleted syncs a Stripe-portal cancellation back to
// our CSASubscription row. An abandoned/expired checkout simply leaves the
// order PENDING — no need to react to every Stripe event on the first pass.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Signature verification failed: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.mode === "payment") {
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (order && order.status === "PENDING") {
          await db.$transaction([
            db.order.update({
              where: { id: order.id },
              data: {
                status: "PAID",
                stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
              },
            }),
            ...order.items.map((item) =>
              db.product.updateMany({
                where: { id: item.productId, stockOnHand: { not: null } },
                data: { stockOnHand: { decrement: item.quantity } },
              }),
            ),
          ]);
        }
      }
    }

    if (session.mode === "subscription" && typeof session.subscription === "string") {
      const { customerId, productId, frequency } = session.metadata ?? {};
      if (customerId && productId && (frequency === "WEEKLY" || frequency === "FORTNIGHTLY")) {
        await db.cSASubscription.upsert({
          where: { stripeSubscriptionId: session.subscription },
          update: {},
          create: { farmId: (await db.customer.findUniqueOrThrow({ where: { id: customerId } })).farmId, customerId, productId, frequency, stripeSubscriptionId: session.subscription },
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await db.cSASubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ received: true });
}
