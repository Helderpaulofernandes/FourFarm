import { z } from "zod";

export const itemTypes = ["SEED", "FEED", "COMPOST", "CONDITIONER", "AMENDMENT", "PACKAGING", "PRODUCT", "OTHER"] as const;

export const itemSchema = z.object({
  itemType: z.enum(itemTypes),
  code: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  defaultUnit: z.string().min(1, "Required"),
});
export type ItemInput = z.infer<typeof itemSchema>;

export const inventoryLotSchema = z.object({
  itemId: z.string().min(1),
  lotCode: z.string().min(1, "Required"),
  quantityReceived: z.coerce.number().positive(),
  unit: z.string().min(1, "Required"),
  unitCost: z.coerce.number().nonnegative().optional(),
});
export type InventoryLotInput = z.infer<typeof inventoryLotSchema>;

export const logActivityInputSchema = z.object({
  batchId: z.string().min(1),
  inventoryLotId: z.string().min(1),
  quantity: z.coerce.number().positive(),
});
export type LogActivityInputInput = z.infer<typeof logActivityInputSchema>;
