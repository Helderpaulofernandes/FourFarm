import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function upsertYearRoundProtection(cropId: string, protectionMethodId: string) {
  const existing = await db.cropProtectionMethod.findFirst({
    where: { cropId, protectionMethodId, season: null },
  });
  if (existing) return existing;
  return db.cropProtectionMethod.create({
    data: { cropId, protectionMethodId, season: null },
  });
}

async function main() {
  const farm = await db.farm.upsert({
    where: { id: "seed-farm" },
    update: {},
    create: {
      id: "seed-farm",
      name: "Four Farm",
      timezone: "Africa/Johannesburg",
    },
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  await db.user.upsert({
    where: { email: "admin@fourfarm.local" },
    update: {},
    create: {
      farmId: farm.id,
      email: "admin@fourfarm.local",
      name: "Farm Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  const flymesh = await db.protectionMethod.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Insect mesh / flymesh" } },
    update: {},
    create: { farmId: farm.id, name: "Insect mesh / flymesh" },
  });
  const shadeCloth = await db.protectionMethod.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Shade cloth" } },
    update: {},
    create: { farmId: farm.id, name: "Shade cloth" },
  });
  const greenhouseFilm = await db.protectionMethod.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Greenhouse film" } },
    update: {},
    create: { farmId: farm.id, name: "Greenhouse film" },
  });

  const tomato = await db.crop.upsert({
    where: { farmId_name_variety: { farmId: farm.id, name: "Tomato", variety: "Roma" } },
    update: {},
    create: {
      farmId: farm.id,
      name: "Tomato",
      variety: "Roma",
      propagationMethod: "TRANSPLANT",
      daysToMaturityMin: 70,
      daysToMaturityMax: 85,
      spacingCm: 60,
    },
  });
  await db.cropProtectionMethod.upsert({
    where: {
      cropId_protectionMethodId_season: {
        cropId: tomato.id,
        protectionMethodId: shadeCloth.id,
        season: "DRY",
      },
    },
    update: {},
    create: { cropId: tomato.id, protectionMethodId: shadeCloth.id, season: "DRY" },
  });
  // Compound unique keys can't be queried with null (SQL NULL != NULL), so
  // year-round associations (season: null) need a manual find-then-create.
  await upsertYearRoundProtection(tomato.id, greenhouseFilm.id);
  await db.cropSeasonalMultiplier.upsert({
    where: { cropId_season: { cropId: tomato.id, season: "WET" } },
    update: {},
    create: { cropId: tomato.id, season: "WET", multiplier: 1.15 },
  });
  await db.cropSeasonalMultiplier.upsert({
    where: { cropId_season: { cropId: tomato.id, season: "DRY" } },
    update: {},
    create: { cropId: tomato.id, season: "DRY", multiplier: 0.95 },
  });

  const lettuce = await db.crop.upsert({
    where: { farmId_name_variety: { farmId: farm.id, name: "Lettuce", variety: "Butterhead" } },
    update: {},
    create: {
      farmId: farm.id,
      name: "Lettuce",
      variety: "Butterhead",
      propagationMethod: "TRANSPLANT",
      daysToMaturityMin: 45,
      daysToMaturityMax: 55,
      spacingCm: 25,
    },
  });
  await upsertYearRoundProtection(lettuce.id, flymesh.id);
  await db.cropSeasonalMultiplier.upsert({
    where: { cropId_season: { cropId: lettuce.id, season: "WET" } },
    update: {},
    create: { cropId: lettuce.id, season: "WET", multiplier: 1.2 },
  });
  await db.cropSeasonalMultiplier.upsert({
    where: { cropId_season: { cropId: lettuce.id, season: "DRY" } },
    update: {},
    create: { cropId: lettuce.id, season: "DRY", multiplier: 0.9 },
  });

  for (let x = 1; x <= 3; x++) {
    for (let y = 1; y <= 2; y++) {
      const label = `Bed ${String.fromCharCode(64 + x)}${y}`;
      await db.growingUnit.upsert({
        where: { farmId_label: { farmId: farm.id, label } },
        update: {},
        create: {
          farmId: farm.id,
          unitType: "BED",
          label,
          gridX: x,
          gridY: y,
          lengthM: 6,
          widthM: 1.2,
          status: "AVAILABLE",
        },
      });
    }
  }

  for (let n = 1; n <= 2; n++) {
    await db.growingUnit.upsert({
      where: { farmId_label: { farmId: farm.id, label: `Tractor ${n}` } },
      update: {},
      create: {
        farmId: farm.id,
        unitType: "TRACTOR",
        label: `Tractor ${n}`,
        gridX: 10 + n,
        gridY: 1,
        capacity: 50,
        status: "AVAILABLE",
      },
    });
  }

  await db.inputMaterial.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Compost" } },
    update: {},
    create: { farmId: farm.id, name: "Compost", category: "COMPOST", unit: "kg", costPerUnit: 2.5 },
  });
  await db.inputMaterial.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Rock dust conditioner" } },
    update: {},
    create: {
      farmId: farm.id,
      name: "Rock dust conditioner",
      category: "CONDITIONER",
      unit: "kg",
      costPerUnit: 4,
    },
  });
  await db.inputMaterial.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Layer feed" } },
    update: {},
    create: { farmId: farm.id, name: "Layer feed", category: "FEED", unit: "kg", costPerUnit: 8.5 },
  });

  console.log("Seed complete.");
  console.log(`Admin login: admin@fourfarm.local / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
