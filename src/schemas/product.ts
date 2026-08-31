import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  category: z.string().optional(),
  saleUnit: z.string().min(1, "Required"),
  standardPackSize: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  varietyBreedId: z.string().optional(),
  profileId: z.string().optional(),
  publicVisible: z.boolean().default(false),
});
export type ProductInput = z.infer<typeof productSchema>;
