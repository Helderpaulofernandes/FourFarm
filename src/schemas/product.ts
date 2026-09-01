import { z } from "zod";
import { optionalPositiveNumber, optionalPositiveInt } from "@/lib/zod-helpers";

export const productSchema = z.object({
  sku: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  category: z.string().optional(),
  saleUnit: z.string().min(1, "Required"),
  standardPackSize: z.string().optional(),
  price: optionalPositiveNumber(),
  // Left unset = untracked/unlimited stock, so listing a product never
  // requires deciding on an inventory count up front.
  stockOnHand: optionalPositiveInt(),
  primaryMediaUrl: z.string().optional(),
  varietyBreedId: z.string().optional(),
  profileId: z.string().optional(),
  publicVisible: z.boolean().default(false),
  isSubscription: z.boolean().default(false),
});
export type ProductInput = z.infer<typeof productSchema>;
