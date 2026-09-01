import { z } from "zod";
import { checkoutCustomerSchema } from "@/schemas/order";

export const createBookingSchema = z.object({
  customer: checkoutCustomerSchema,
  requestedDate: z.coerce.date(),
  partySize: z.coerce.number().int().positive(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const bookingStatuses = ["PENDING", "APPROVED", "DECLINED", "CANCELLED"] as const;
