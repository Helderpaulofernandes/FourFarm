import Link from "next/link";
import { getOrder } from "@/server/actions/orders";
import { formatMoney } from "@/lib/format";
import { MarkFulfilledButton } from "@/components/MarkFulfilledButton";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-green-700 underline">
          ← Back to orders
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-stone-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-stone-500">
              {order.status.toLowerCase()} · {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          {order.status === "PAID" && <MarkFulfilledButton orderId={order.id} />}
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-medium text-stone-500">Customer</h2>
        <p className="text-stone-900">{order.customer.name}</p>
        <p className="text-sm text-stone-500">{order.customer.email}</p>
        {order.customer.phone && <p className="text-sm text-stone-500">{order.customer.phone}</p>}
        {order.fulfilmentNote && <p className="mt-2 text-sm text-stone-600">Note: {order.fulfilmentNote}</p>}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-medium text-stone-500">Items</h2>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-stone-600">
              <span>
                {item.quantity} × {item.productName}
              </span>
              <span>{formatMoney(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 font-medium text-stone-900">
          <span>Total</span>
          <span>{formatMoney(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
