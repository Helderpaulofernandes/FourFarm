"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/server/actions/bookings";

export function BookingActionButtons({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick(status: "APPROVED" | "DECLINED") {
    setBusy(true);
    await updateBookingStatus(bookingId, status);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleClick("APPROVED")}
        disabled={busy}
        className="h-9 rounded-lg bg-green-700 px-3 text-sm font-medium text-white disabled:opacity-60"
      >
        Approve
      </button>
      <button
        onClick={() => handleClick("DECLINED")}
        disabled={busy}
        className="h-9 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700 disabled:opacity-60"
      >
        Decline
      </button>
    </div>
  );
}
