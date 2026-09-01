"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscribeButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [frequency, setFrequency] = useState<"WEEKLY" | "FORTNIGHTLY">("WEEKLY");

  return (
    <div className="mt-4 flex items-center gap-3">
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as "WEEKLY" | "FORTNIGHTLY")}
        className="h-11 rounded-lg border border-stone-300 px-3"
      >
        <option value="WEEKLY">Weekly</option>
        <option value="FORTNIGHTLY">Fortnightly</option>
      </select>
      <button
        type="button"
        onClick={() => router.push(`/store/csa/subscribe?product=${productId}&frequency=${frequency}`)}
        className="h-11 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800"
      >
        Subscribe
      </button>
    </div>
  );
}
