import { db } from "@/lib/db";

let cachedFarmId: string | null = null;

/**
 * Single source of truth for "which farm are we scoped to" — every farm-scoped
 * query/mutation should go through this instead of assuming a hardcoded id.
 * Today there's exactly one Farm row; this is the seam a future multi-tenant
 * lookup (session, subdomain, etc.) would replace.
 */
export async function getCurrentFarmId(): Promise<string> {
  if (cachedFarmId) return cachedFarmId;
  const farm = await db.farm.findFirstOrThrow();
  cachedFarmId = farm.id;
  return farm.id;
}
