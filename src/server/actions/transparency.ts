"use server";

import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";

const ACTIVE_BATCH_STATUSES = ["PLANNED", "SEEDED", "IN_NURSERY", "READY_TO_TRANSPLANT", "TRANSPLANTED", "GROWING", "HARVESTING"] as const;

// Public farm-wide overview — select-only, no cost/margin/internal fields,
// same discipline as every other public action in src/server/actions/products.ts.
export async function getPublicFarmOverview() {
  const farmId = await getCurrentFarmId();

  const [farm, methods, batchCounts, areaCounts] = await Promise.all([
    db.farm.findUniqueOrThrow({
      where: { id: farmId },
      select: { name: true, climateZone: true, timezone: true, publicStory: true, heroImageUrl: true },
    }),
    db.productionMethod.findMany({
      where: { farmId, active: true, publicDescription: { not: null } },
      select: { id: true, name: true, productionSystem: true, publicDescription: true },
      orderBy: { name: "asc" },
    }),
    db.productionBatch.groupBy({
      by: ["enterpriseType"],
      where: { farmId, status: { in: [...ACTIVE_BATCH_STATUSES] } },
      _count: { _all: true },
    }),
    db.productionArea.groupBy({
      by: ["areaType"],
      where: { farmId },
      _count: { _all: true },
    }),
  ]);

  return {
    farm,
    methods,
    batchCounts: batchCounts.map((b) => ({ enterpriseType: b.enterpriseType, count: b._count._all })),
    areaCounts: areaCounts.map((a) => ({ areaType: a.areaType, count: a._count._all })),
  };
}
