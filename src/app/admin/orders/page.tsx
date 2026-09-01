import Link from "next/link";
import { listOrders } from "@/server/actions/orders";
import { formatMoney } from "@/lib/format";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-stone-200 text-stone-700",
  PAID: "bg-blue-100 text-blue-700",
  FULFILLED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-stone-900">Orders</h1>

      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
          >
            <div>
              <div className="font-medium text-stone-900">{order.customer.name}</div>
              <div className="text-sm text-stone-500">
                {order.items.length} item{order.items.length === 1 ? "" : "s"} · {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-stone-900">{formatMoney(order.total)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status]}`}>{order.status.toLowerCase()}</span>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-sm text-stone-500">No orders yet.</p>}
      </div>
    </div>
  );
}
