import { z } from "zod";

export const farmSettingsSchema = z.object({
  name: z.string().min(1, "Required"),
  climateZone: z.string().optional(),
  publicStory: z.string().optional(),
  heroImageUrl: z.string().optional(),
});
export type FarmSettingsInput = z.infer<typeof farmSettingsSchema>;
