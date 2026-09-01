import Link from "next/link";
import { getCSASubscriptionBySessionId } from "@/server/actions/csa";
import { formatMoney } from "@/lib/format";

export default async function CSASuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const subscription = session_id ? await getCSASubscriptionBySessionId(session_id) : null;

  if (!subscription) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-stone-900">We couldn&apos;t confirm that subscription yet</h1>
        <p className="mt-2 text-stone-500">
          If you completed payment, check your email for confirmation — it can take a moment to appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Subscription confirmed</h1>
      <p className="mt-2 text-stone-700">
        {subscription.product.name} — {formatMoney(subscription.product.price ?? 0)} every{" "}
        {subscription.frequency === "FORTNIGHTLY" ? "fortnight" : "week"}.
      </p>
      <p className="mt-4 text-sm text-stone-500">
        Manage or cancel any time from{" "}
        <Link href="/store/csa/manage" className="text-green-700 underline">
          your subscription page
        </Link>
        .
      </p>
      <Link href="/store" className="mt-6 inline-block text-green-700 underline">
        Continue browsing
      </Link>
    </div>
  );
}
