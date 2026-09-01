import { listCSASubscriptions } from "@/server/actions/csa";
import { formatMoney } from "@/lib/format";

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function CSAPage() {
  const subscriptions = await listCSASubscriptions();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-stone-900">CSA Subscriptions</h1>

      <div className="space-y-2">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
            <div>
              <div className="font-medium text-stone-900">{sub.customer.name}</div>
              <div className="text-sm text-stone-500">
                {sub.product.name} · {sub.frequency === "FORTNIGHTLY" ? "fortnightly" : "weekly"} · {formatMoney(sub.product.price ?? 0)} ·{" "}
                {sub.customer.email}
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[sub.status]}`}>{sub.status.toLowerCase()}</span>
          </div>
        ))}
        {subscriptions.length === 0 && <p className="text-sm text-stone-500">No subscriptions yet.</p>}
      </div>
    </div>
  );
}
