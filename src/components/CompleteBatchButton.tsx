"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeBatch } from "@/server/actions/production-batches";

export function CompleteBatchButton({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    if (!confirm("Mark this batch as completed? Its area will become available again.")) return;
    setSubmitting(true);
    await completeBatch(batchId);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={submitting}
      className="h-10 rounded-lg border border-stone-300 px-4 text-sm font-medium text-stone-700 disabled:opacity-60"
    >
      {submitting ? "Completing..." : "Complete batch"}
    </button>
  );
}
