import { z } from "zod";
import { checkoutCustomerSchema } from "@/schemas/order";

export const csaFrequencies = ["WEEKLY", "FORTNIGHTLY"] as const;

export const createCSASubscriptionSchema = z.object({
  productId: z.string().min(1),
  frequency: z.enum(csaFrequencies),
  customer: checkoutCustomerSchema,
});
export type CreateCSASubscriptionInput = z.infer<typeof createCSASubscriptionSchema>;

export const billingPortalLookupSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type BillingPortalLookupInput = z.infer<typeof billingPortalLookupSchema>;
