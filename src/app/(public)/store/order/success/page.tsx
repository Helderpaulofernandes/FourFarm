import Link from "next/link";
import { getOrderBySessionId } from "@/server/actions/orders";
import { formatMoney } from "@/lib/format";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const order = session_id ? await getOrderBySessionId(session_id) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-stone-900">We couldn&apos;t find that order</h1>
        <p className="mt-2 text-stone-500">
          If you completed a payment, check your email for confirmation, or{" "}
          <Link href="/store/order-lookup" className="text-green-700 underline">
            look up your order
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">
        {order.status === "PAID" || order.status === "FULFILLED" ? "Thanks for your order!" : "Order received"}
      </h1>
      <p className="mt-1 text-stone-500">
        Order #{order.id.slice(-8).toUpperCase()} · {order.status.toLowerCase()}
      </p>

      <div className="mt-6 space-y-1 rounded-xl border border-stone-200 bg-white p-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-stone-600">
            <span>
              {item.quantity} × {item.productName}
            </span>
            <span>{formatMoney(item.lineTotal)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 font-medium text-stone-900">
          <span>Total</span>
          <span>{formatMoney(order.total)}</span>
        </div>
      </div>

      <Link href="/store" className="mt-6 inline-block text-green-700 underline">
        Continue browsing
      </Link>
    </div>
  );
}
