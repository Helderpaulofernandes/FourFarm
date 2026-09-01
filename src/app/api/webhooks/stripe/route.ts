import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// Only checkout.session.completed is handled for v1 — an abandoned or
// expired checkout simply leaves the order PENDING, visible and cancellable
// from /admin/orders. No need to react to every Stripe event on the first pass.
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

  return NextResponse.json({ received: true });
}
