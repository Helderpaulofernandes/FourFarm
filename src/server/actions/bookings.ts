"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import { createBookingSchema, bookingStatuses, type CreateBookingInput } from "@/schemas/booking";

export async function createBooking(input: CreateBookingInput) {
  const data = createBookingSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const customer = await db.customer.upsert({
    where: { farmId_email: { farmId, email: data.customer.email } },
    update: { name: data.customer.name, phone: data.customer.phone },
    create: { farmId, email: data.customer.email, name: data.customer.name, phone: data.customer.phone },
  });

  return db.pickYourOwnBooking.create({
    data: {
      farmId,
      customerId: customer.id,
      requestedDate: data.requestedDate,
      partySize: data.partySize,
      notes: data.customer.note,
    },
  });
}

export async function listBookings() {
  const farmId = await getCurrentFarmId();
  return db.pickYourOwnBooking.findMany({
    where: { farmId },
    include: { customer: true },
    orderBy: { requestedDate: "asc" },
  });
}

export async function updateBookingStatus(id: string, status: (typeof bookingStatuses)[number]) {
  const farmId = await getCurrentFarmId();
  await db.pickYourOwnBooking.updateMany({ where: { id, farmId }, data: { status } });
  revalidatePath("/admin/bookings");
}
