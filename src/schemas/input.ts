import { z } from "zod";

export const inputCategories = ["COMPOST", "CONDITIONER", "AMENDMENT", "FEED", "OTHER"] as const;

export const inputMaterialSchema = z.object({
  name: z.string().min(1, "Required"),
  category: z.enum(inputCategories),
  unit: z.string().min(1, "Required"),
  costPerUnit: z.coerce.number().positive(),
});

export type InputMaterialInput = z.infer<typeof inputMaterialSchema>;

export const inputApplicationSchema = z.object({
  occupancyId: z.string().min(1),
  inputMaterialId: z.string().min(1),
  quantity: z.coerce.number().positive(),
});

export type InputApplicationInput = z.infer<typeof inputApplicationSchema>;
