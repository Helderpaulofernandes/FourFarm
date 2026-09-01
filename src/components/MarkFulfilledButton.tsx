"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markOrderFulfilled } from "@/server/actions/orders";

export function MarkFulfilledButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await markOrderFulfilled(orderId);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="h-10 rounded-lg bg-green-700 px-4 text-sm font-medium text-white active:bg-green-800 disabled:opacity-60"
    >
      {busy ? "Updating..." : "Mark fulfilled"}
    </button>
  );
}
