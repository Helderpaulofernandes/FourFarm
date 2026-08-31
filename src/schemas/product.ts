import { z } from "zod";
import { optionalPositiveNumber } from "@/lib/zod-helpers";

export const productSchema = z.object({
  sku: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  category: z.string().optional(),
  saleUnit: z.string().min(1, "Required"),
  standardPackSize: z.string().optional(),
  price: optionalPositiveNumber(),
  varietyBreedId: z.string().optional(),
  profileId: z.string().optional(),
  publicVisible: z.boolean().default(false),
});
export type ProductInput = z.infer<typeof productSchema>;
