import { listBookings } from "@/server/actions/bookings";
import { BookingActionButtons } from "@/components/BookingActionButtons";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-stone-200 text-stone-700",
  APPROVED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function BookingsPage() {
  const bookings = await listBookings();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-stone-900">Pick-Your-Own Bookings</h1>

      <div className="space-y-2">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
            <div>
              <div className="font-medium text-stone-900">{booking.customer.name}</div>
              <div className="text-sm text-stone-500">
                {new Date(booking.requestedDate).toLocaleDateString()} · {booking.partySize} people · {booking.customer.email}
              </div>
              {booking.notes && <div className="mt-1 text-sm text-stone-600">{booking.notes}</div>}
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[booking.status]}`}>{booking.status.toLowerCase()}</span>
              {booking.status === "PENDING" && <BookingActionButtons bookingId={booking.id} />}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-sm text-stone-500">No bookings yet.</p>}
      </div>
    </div>
  );
}
