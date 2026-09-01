import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const tenant = await db.tenant.upsert({
    where: { slug: "four-farm" },
    update: {},
    create: { id: "seed-tenant", name: "Four Farm", slug: "four-farm" },
  });

  const farm = await db.farm.upsert({
    where: { id: "seed-farm" },
    update: {},
    create: {
      id: "seed-farm",
      tenantId: tenant.id,
      name: "Four Farm — Palmwoods",
      timezone: "Australia/Brisbane",
      climateZone: "Subtropical highlands (SE QLD hinterland)",
      latitude: -26.6858,
      longitude: 152.9515,
      heroImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80",
      publicStory:
        "We're a small no-till market garden and pastured livestock operation in the Palmwoods hinterland, growing food the way we'd want to eat it ourselves — building soil instead of depleting it, moving animals across pasture instead of confining them, and keeping every step of the process open to the people who eat what we grow.",
    },
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  await db.user.upsert({
    where: { email: "admin@fourfarm.local" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@fourfarm.local",
      name: "Farm Admin",
      role: "OWNER",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  // ---------- Species / VarietyBreed ----------

  const tomatoSpecies = await db.species.upsert({
    where: { farmId_commonName: { farmId: farm.id, commonName: "Tomato" } },
    update: {},
    create: {
      farmId: farm.id,
      kingdom: "PLANT",
      commonName: "Tomato",
      scientificName: "Solanum lycopersicum",
      family: "Solanaceae",
      lifeCycle: "ANNUAL",
      primaryRole: "Food",
    },
  });

  const tomatoRoma = await db.varietyBreed.upsert({
    where: { speciesId_name: { speciesId: tomatoSpecies.id, name: "Roma" } },
    update: {},
    create: {
      speciesId: tomatoSpecies.id,
      name: "Roma",
      recordType: "CULTIVAR",
      rotationGroup: "FRUIT",
      openPollinated: true,
      typicalColour: "Red",
      publicDescription: "A classic plum tomato, meaty and ideal for sauce.",
    },
  });

  const lettuceSpecies = await db.species.upsert({
    where: { farmId_commonName: { farmId: farm.id, commonName: "Lettuce" } },
    update: {},
    create: {
      farmId: farm.id,
      kingdom: "PLANT",
      commonName: "Lettuce",
      scientificName: "Lactuca sativa",
      family: "Asteraceae",
      lifeCycle: "ANNUAL",
      primaryRole: "Food",
    },
  });

  const lettuceButterhead = await db.varietyBreed.upsert({
    where: { speciesId_name: { speciesId: lettuceSpecies.id, name: "Butterhead" } },
    update: {},
    create: {
      speciesId: lettuceSpecies.id,
      name: "Butterhead",
      recordType: "CULTIVAR",
      rotationGroup: "LEAF",
      openPollinated: true,
      typicalColour: "Green",
      publicDescription: "Soft, buttery-textured salad lettuce.",
    },
  });

  // ---------- Production method / profile ----------

  const noDigMethod = await db.productionMethod.upsert({
    where: { farmId_name: { farmId: farm.id, name: "No-dig intensive bed" } },
    update: {},
    create: {
      farmId: farm.id,
      name: "No-dig intensive bed",
      productionSystem: "MARKET_GARDEN",
      internalDescription: "Compost-topped permanent beds, no tillage, hand tools only.",
      publicDescription: "Grown using no-dig, no-till methods that build soil rather than disturb it.",
    },
  });

  const tomatoProfile = await db.productionProfile.upsert({
    where: { varietyBreedId_methodId_version: { varietyBreedId: tomatoRoma.id, methodId: noDigMethod.id, version: 1 } },
    update: {},
    create: {
      varietyBreedId: tomatoRoma.id,
      methodId: noDigMethod.id,
      name: "Roma spring field profile",
      version: 1,
      nurseryRequired: true,
      targetNurseryDays: 35,
      targetProductionDays: 75,
      targetHarvestStartDays: 75,
      targetHarvestWindowDays: 55,
      expectedSurvivalPct: 90,
      expectedYieldValue: 4,
      expectedYieldUnit: "kg/plant",
      sourceType: "OWN_TRIAL",
      confidenceLevel: "ESTIMATED",
    },
  });

  await db.cropProfile.upsert({
    where: { profileId: tomatoProfile.id },
    update: {},
    create: {
      profileId: tomatoProfile.id,
      daysToGerminationMin: 5,
      daysToGerminationTypical: 7,
      daysToGerminationMax: 10,
      germinationRatePct: 85,
      germinationTempMinC: 15,
      germinationTempOptC: 24,
      germinationTempMaxC: 32,
      seedDepthMm: 6,
      seedsPerCell: 1,
      recommendedTrayType: "72-cell",
      daysInNursery: 35,
      hardeningDays: 7,
      targetTransplantAgeDays: 35,
      plantSpacingMm: 600,
      rowSpacingMm: 900,
      bedWidthMm: 900,
      plantsPerM2: 2,
      trellisRequired: true,
      pruningRequired: true,
      mulchRecommended: true,
      frostSensitivity: "High",
      heatSensitivity: "Moderate",
      maturityBasis: "FROM_SOWING",
      daysToFirstHarvest: 75,
      harvestWindowDays: 55,
      harvestFrequencyDays: 4,
      successionFriendly: true,
      successionIntervalDays: 21,
    },
  });

  // Palmwoods sits in the SE QLD hinterland: warm wet summers, mild but
  // occasionally light-frost winters (unlike the coast) — tomato sowing is
  // timed to avoid that frost window.
  await db.seasonRule.createMany({
    data: [
      {
        profileId: tomatoProfile.id,
        locationOrClimateZone: "Palmwoods hinterland",
        activityType: "SOW",
        startMonth: 8,
        startWeek: 3,
        endMonth: 10,
        endWeek: 2,
        suitability: "PREFERRED",
        constraintType: "Frost",
        notes: "Sow after last frost risk passes in the hinterland.",
      },
      {
        profileId: tomatoProfile.id,
        locationOrClimateZone: "Palmwoods hinterland",
        activityType: "SOW",
        startMonth: 6,
        endMonth: 7,
        suitability: "AVOID",
        constraintType: "Frost",
        notes: "Winter frost risk at elevation.",
      },
    ],
    skipDuplicates: true,
  });

  const tomatoWorkflow = await db.workflowTemplate.upsert({
    where: { id: "seed-workflow-tomato" },
    update: {},
    create: {
      id: "seed-workflow-tomato",
      profileId: tomatoProfile.id,
      name: "Roma field workflow",
      version: 1,
      anchorType: "SEED_DATE",
      schedulingDirection: "FORWARD",
    },
  });

  // The exact task-offset example worked through in conversation.
  const tomatoTasks: {
    taskType: "SOW" | "GERMINATION_CHECK" | "POT_UP" | "FERTILIZE" | "HARDEN_OFF" | "TRANSPLANT" | "TRELLIS" | "PRUNE" | "HARVEST" | "OTHER";
    taskName: string;
    sequence: number;
    offsetFromAnchorDays: number;
  }[] = [
    { taskType: "SOW", taskName: "Seed", sequence: 1, offsetFromAnchorDays: 0 },
    { taskType: "GERMINATION_CHECK", taskName: "Germination Check", sequence: 2, offsetFromAnchorDays: 7 },
    { taskType: "POT_UP", taskName: "Pot Up", sequence: 3, offsetFromAnchorDays: 14 },
    { taskType: "FERTILIZE", taskName: "Fertilise Seedlings", sequence: 4, offsetFromAnchorDays: 21 },
    { taskType: "HARDEN_OFF", taskName: "Harden Off", sequence: 5, offsetFromAnchorDays: 28 },
    { taskType: "TRANSPLANT", taskName: "Transplant", sequence: 6, offsetFromAnchorDays: 35 },
    { taskType: "TRELLIS", taskName: "Trellis Install", sequence: 7, offsetFromAnchorDays: 42 },
    { taskType: "PRUNE", taskName: "First Prune", sequence: 8, offsetFromAnchorDays: 56 },
    { taskType: "HARVEST", taskName: "Harvest Start", sequence: 9, offsetFromAnchorDays: 75 },
    { taskType: "OTHER", taskName: "Crop Removal", sequence: 10, offsetFromAnchorDays: 130 },
  ];
  for (const task of tomatoTasks) {
    await db.workflowTaskTemplate.upsert({
      where: { id: `seed-task-tomato-${task.sequence}` },
      update: {},
      create: { id: `seed-task-tomato-${task.sequence}`, workflowTemplateId: tomatoWorkflow.id, ...task },
    });
  }

  const lettuceProfile = await db.productionProfile.upsert({
    where: { varietyBreedId_methodId_version: { varietyBreedId: lettuceButterhead.id, methodId: noDigMethod.id, version: 1 } },
    update: {},
    create: {
      varietyBreedId: lettuceButterhead.id,
      methodId: noDigMethod.id,
      name: "Butterhead succession profile",
      version: 1,
      nurseryRequired: true,
      targetNurseryDays: 21,
      targetProductionDays: 49,
      targetHarvestStartDays: 49,
      targetHarvestWindowDays: 14,
      expectedSurvivalPct: 92,
      expectedYieldValue: 0.25,
      expectedYieldUnit: "kg/plant",
      sourceType: "OWN_TRIAL",
      confidenceLevel: "ESTIMATED",
    },
  });

  await db.cropProfile.upsert({
    where: { profileId: lettuceProfile.id },
    update: {},
    create: {
      profileId: lettuceProfile.id,
      daysToGerminationMin: 4,
      daysToGerminationTypical: 6,
      daysToGerminationMax: 10,
      germinationRatePct: 90,
      germinationTempMinC: 10,
      germinationTempOptC: 18,
      germinationTempMaxC: 24,
      seedDepthMm: 3,
      seedsPerCell: 1,
      recommendedTrayType: "128-cell",
      daysInNursery: 21,
      hardeningDays: 5,
      targetTransplantAgeDays: 21,
      plantSpacingMm: 250,
      rowSpacingMm: 250,
      bedWidthMm: 900,
      plantsPerM2: 16,
      mulchRecommended: true,
      heatSensitivity: "High — bolts in summer heat",
      maturityBasis: "FROM_TRANSPLANT",
      daysToFirstHarvest: 28,
      harvestWindowDays: 14,
      successionFriendly: true,
      successionIntervalDays: 14,
    },
  });

  const lettuceWorkflow = await db.workflowTemplate.upsert({
    where: { id: "seed-workflow-lettuce" },
    update: {},
    create: {
      id: "seed-workflow-lettuce",
      profileId: lettuceProfile.id,
      name: "Butterhead nursery-to-bed workflow",
      version: 1,
      anchorType: "SEED_DATE",
      schedulingDirection: "FORWARD",
    },
  });

  const lettuceTasks: {
    taskType: "SOW" | "GERMINATION_CHECK" | "HARDEN_OFF" | "TRANSPLANT" | "HARVEST";
    taskName: string;
    sequence: number;
    offsetFromAnchorDays: number;
  }[] = [
    { taskType: "SOW", taskName: "Seed", sequence: 1, offsetFromAnchorDays: 0 },
    { taskType: "GERMINATION_CHECK", taskName: "Germination Check", sequence: 2, offsetFromAnchorDays: 6 },
    { taskType: "HARDEN_OFF", taskName: "Harden Off", sequence: 3, offsetFromAnchorDays: 16 },
    { taskType: "TRANSPLANT", taskName: "Transplant", sequence: 4, offsetFromAnchorDays: 21 },
    { taskType: "HARVEST", taskName: "Harvest Start", sequence: 5, offsetFromAnchorDays: 49 },
  ];
  for (const task of lettuceTasks) {
    await db.workflowTaskTemplate.upsert({
      where: { id: `seed-task-lettuce-${task.sequence}` },
      update: {},
      create: { id: `seed-task-lettuce-${task.sequence}`, workflowTemplateId: lettuceWorkflow.id, ...task },
    });
  }

  // ---------- Expanded crop database: staples, roots, brassicas, alliums, legumes, herbs ----------
  // Loop-driven rather than 30 repeated upsert blocks like Tomato/Lettuce above — same
  // shape (Species -> VarietyBreed -> ProductionProfile -> CropProfile -> SeasonRule),
  // reusing the existing "No-dig intensive bed" method. sowMonthStart/End give each crop
  // a real Palmwoods-hinterland-subtropical sowing window (mild but light-frost winters at
  // elevation, hot humid summers) so there's always something in the "preferred to sow"
  // window somewhere in this list, whatever month it is — the point of the crop database.
  type MarketGardenCrop = {
    commonName: string;
    scientificName: string;
    family: string;
    lifeCycle: "ANNUAL" | "BIENNIAL" | "PERENNIAL";
    varietyName: string;
    rotationGroup: (typeof rotationGroups)[number] | null;
    publicDescription: string;
    nurseryRequired: boolean;
    targetNurseryDays: number | null;
    hardeningDays: number | null;
    daysToGerminationTypical: number | null;
    targetHarvestStartDays: number;
    targetHarvestWindowDays: number | null;
    plantSpacingMm: number;
    rowSpacingMm: number;
    sowMonthStart: number;
    sowMonthEnd: number;
  };
  const rotationGroups = ["ROOT", "ALLIUM", "FRUIT", "LEGUME", "LEAF"] as const;

  const marketGardenCrops: MarketGardenCrop[] = [
    { commonName: "Kale", scientificName: "Brassica oleracea var. palmifolia", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Tuscan Kale", rotationGroup: "LEAF", publicDescription: "A dark, crinkled cooking green that gets sweeter after a light frost.", nurseryRequired: true, targetNurseryDays: 21, hardeningDays: 5, daysToGerminationTypical: 6, targetHarvestStartDays: 60, targetHarvestWindowDays: 60, plantSpacingMm: 400, rowSpacingMm: 450, sowMonthStart: 2, sowMonthEnd: 6 },
    { commonName: "Silverbeet", scientificName: "Beta vulgaris subsp. vulgaris", family: "Amaranthaceae", lifeCycle: "PERENNIAL", varietyName: "Rainbow Chard", rotationGroup: "LEAF", publicDescription: "A hardy, colourful cut-and-come-again green that crops for months from one planting.", nurseryRequired: true, targetNurseryDays: 21, hardeningDays: 5, daysToGerminationTypical: 8, targetHarvestStartDays: 50, targetHarvestWindowDays: 90, plantSpacingMm: 300, rowSpacingMm: 350, sowMonthStart: 1, sowMonthEnd: 12 },
    { commonName: "Pak Choy", scientificName: "Brassica rapa subsp. chinensis", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Pak Choy", rotationGroup: "LEAF", publicDescription: "A crisp, mild Asian green ready in under six weeks.", nurseryRequired: true, targetNurseryDays: 14, hardeningDays: 4, daysToGerminationTypical: 5, targetHarvestStartDays: 40, targetHarvestWindowDays: 14, plantSpacingMm: 200, rowSpacingMm: 250, sowMonthStart: 3, sowMonthEnd: 8 },
    { commonName: "Mizuna", scientificName: "Brassica rapa var. nipposinica", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Mizuna", rotationGroup: "LEAF", publicDescription: "A feathery, peppery salad green that keeps regrowing after cutting.", nurseryRequired: true, targetNurseryDays: 14, hardeningDays: 4, daysToGerminationTypical: 5, targetHarvestStartDays: 35, targetHarvestWindowDays: 30, plantSpacingMm: 200, rowSpacingMm: 200, sowMonthStart: 2, sowMonthEnd: 8 },
    { commonName: "Rocket", scientificName: "Eruca sativa", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Wild Rocket", rotationGroup: "LEAF", publicDescription: "Peppery salad rocket, fast enough for tight succession plantings.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 6, targetHarvestStartDays: 30, targetHarvestWindowDays: 20, plantSpacingMm: 150, rowSpacingMm: 200, sowMonthStart: 2, sowMonthEnd: 9 },
    { commonName: "English Spinach", scientificName: "Spinacia oleracea", family: "Amaranthaceae", lifeCycle: "ANNUAL", varietyName: "English Spinach", rotationGroup: "LEAF", publicDescription: "A true cool-season spinach that bolts fast once the weather warms.", nurseryRequired: true, targetNurseryDays: 14, hardeningDays: 5, daysToGerminationTypical: 8, targetHarvestStartDays: 45, targetHarvestWindowDays: 21, plantSpacingMm: 200, rowSpacingMm: 250, sowMonthStart: 3, sowMonthEnd: 6 },
    { commonName: "Mustard Greens", scientificName: "Brassica juncea", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Green Mustard", rotationGroup: "LEAF", publicDescription: "A spicy, fast-growing green, good picked baby or left to full size.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 5, targetHarvestStartDays: 35, targetHarvestWindowDays: 21, plantSpacingMm: 200, rowSpacingMm: 250, sowMonthStart: 2, sowMonthEnd: 8 },
    { commonName: "Sweet Potato", scientificName: "Ipomoea batatas", family: "Convolvulaceae", lifeCycle: "PERENNIAL", varietyName: "Beauregard", rotationGroup: "ROOT", publicDescription: "A vigorous, sweet orange-fleshed staple, planted from slips rather than seed.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: null, targetHarvestStartDays: 130, targetHarvestWindowDays: 30, plantSpacingMm: 300, rowSpacingMm: 900, sowMonthStart: 9, sowMonthEnd: 12 },
    { commonName: "Potato", scientificName: "Solanum tuberosum", family: "Solanaceae", lifeCycle: "ANNUAL", varietyName: "Dutch Cream", rotationGroup: "ROOT", publicDescription: "A creamy, all-purpose potato grown from certified seed potato.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: null, targetHarvestStartDays: 100, targetHarvestWindowDays: 21, plantSpacingMm: 300, rowSpacingMm: 750, sowMonthStart: 2, sowMonthEnd: 4 },
    { commonName: "Cassava", scientificName: "Manihot esculenta", family: "Euphorbiaceae", lifeCycle: "PERENNIAL", varietyName: "Cassava", rotationGroup: "ROOT", publicDescription: "A drought-hardy tropical root staple, grown from stem cuttings, not seed.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: null, targetHarvestStartDays: 270, targetHarvestWindowDays: 60, plantSpacingMm: 900, rowSpacingMm: 900, sowMonthStart: 9, sowMonthEnd: 11 },
    { commonName: "Pumpkin", scientificName: "Cucurbita maxima", family: "Cucurbitaceae", lifeCycle: "ANNUAL", varietyName: "Queensland Blue", rotationGroup: "FRUIT", publicDescription: "A classic blue-grey Queensland pumpkin that stores for months after harvest.", nurseryRequired: true, targetNurseryDays: 21, hardeningDays: 5, daysToGerminationTypical: 7, targetHarvestStartDays: 110, targetHarvestWindowDays: 30, plantSpacingMm: 1500, rowSpacingMm: 1500, sowMonthStart: 9, sowMonthEnd: 11 },
    { commonName: "Zucchini", scientificName: "Cucurbita pepo", family: "Cucurbitaceae", lifeCycle: "ANNUAL", varietyName: "Black Beauty", rotationGroup: "FRUIT", publicDescription: "A prolific bush zucchini, best picked young and often.", nurseryRequired: true, targetNurseryDays: 14, hardeningDays: 4, daysToGerminationTypical: 6, targetHarvestStartDays: 50, targetHarvestWindowDays: 60, plantSpacingMm: 900, rowSpacingMm: 900, sowMonthStart: 9, sowMonthEnd: 1 },
    { commonName: "Cucumber", scientificName: "Cucumis sativus", family: "Cucurbitaceae", lifeCycle: "ANNUAL", varietyName: "Lebanese", rotationGroup: "FRUIT", publicDescription: "A thin-skinned, trellised cucumber with a mild, sweet flavour.", nurseryRequired: true, targetNurseryDays: 14, hardeningDays: 4, daysToGerminationTypical: 5, targetHarvestStartDays: 55, targetHarvestWindowDays: 45, plantSpacingMm: 400, rowSpacingMm: 1200, sowMonthStart: 9, sowMonthEnd: 1 },
    { commonName: "Capsicum", scientificName: "Capsicum annuum", family: "Solanaceae", lifeCycle: "PERENNIAL", varietyName: "California Wonder", rotationGroup: "FRUIT", publicDescription: "A sweet bell capsicum, slow to start but a long, heavy cropper.", nurseryRequired: true, targetNurseryDays: 56, hardeningDays: 7, daysToGerminationTypical: 10, targetHarvestStartDays: 80, targetHarvestWindowDays: 90, plantSpacingMm: 450, rowSpacingMm: 750, sowMonthStart: 8, sowMonthEnd: 11 },
    { commonName: "Eggplant", scientificName: "Solanum melongena", family: "Solanaceae", lifeCycle: "PERENNIAL", varietyName: "Black Beauty Eggplant", rotationGroup: "FRUIT", publicDescription: "A glossy purple eggplant that thrives in the summer heat.", nurseryRequired: true, targetNurseryDays: 56, hardeningDays: 7, daysToGerminationTypical: 8, targetHarvestStartDays: 80, targetHarvestWindowDays: 90, plantSpacingMm: 500, rowSpacingMm: 800, sowMonthStart: 8, sowMonthEnd: 11 },
    { commonName: "Chilli", scientificName: "Capsicum annuum", family: "Solanaceae", lifeCycle: "PERENNIAL", varietyName: "Cayenne", rotationGroup: "FRUIT", publicDescription: "A reliable medium-heat cayenne chilli, prolific once established.", nurseryRequired: true, targetNurseryDays: 56, hardeningDays: 7, daysToGerminationTypical: 10, targetHarvestStartDays: 85, targetHarvestWindowDays: 120, plantSpacingMm: 450, rowSpacingMm: 750, sowMonthStart: 8, sowMonthEnd: 11 },
    { commonName: "Snake Bean", scientificName: "Vigna unguiculata subsp. sesquipedalis", family: "Fabaceae", lifeCycle: "ANNUAL", varietyName: "Red Noodle", rotationGroup: "LEGUME", publicDescription: "A heat-loving, heavy-cropping bean that thrives where regular beans struggle.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 7, targetHarvestStartDays: 65, targetHarvestWindowDays: 45, plantSpacingMm: 200, rowSpacingMm: 1200, sowMonthStart: 9, sowMonthEnd: 1 },
    { commonName: "Snow Pea", scientificName: "Pisum sativum", family: "Fabaceae", lifeCycle: "ANNUAL", varietyName: "Oregon Sugar Pod", rotationGroup: "LEGUME", publicDescription: "A sweet, flat-podded pea for the cooler months, best grown on a trellis.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 8, targetHarvestStartDays: 60, targetHarvestWindowDays: 30, plantSpacingMm: 100, rowSpacingMm: 600, sowMonthStart: 3, sowMonthEnd: 6 },
    { commonName: "Dwarf Bean", scientificName: "Phaseolus vulgaris", family: "Fabaceae", lifeCycle: "ANNUAL", varietyName: "Brown Beauty", rotationGroup: "LEGUME", publicDescription: "A compact bush bean needing no staking, good for tight succession sowing.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 7, targetHarvestStartDays: 55, targetHarvestWindowDays: 21, plantSpacingMm: 150, rowSpacingMm: 600, sowMonthStart: 9, sowMonthEnd: 1 },
    { commonName: "Garlic", scientificName: "Allium sativum", family: "Amaryllidaceae", lifeCycle: "ANNUAL", varietyName: "Australian White", rotationGroup: "ALLIUM", publicDescription: "A pungent, long-storing garlic grown from cloves over the cooler months.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: null, targetHarvestStartDays: 165, targetHarvestWindowDays: 21, plantSpacingMm: 100, rowSpacingMm: 200, sowMonthStart: 3, sowMonthEnd: 5 },
    { commonName: "Spring Onion", scientificName: "Allium fistulosum", family: "Amaryllidaceae", lifeCycle: "PERENNIAL", varietyName: "White Lisbon", rotationGroup: "ALLIUM", publicDescription: "A mild, quick-cropping onion that can be cut and left to regrow.", nurseryRequired: true, targetNurseryDays: 21, hardeningDays: 5, daysToGerminationTypical: 8, targetHarvestStartDays: 60, targetHarvestWindowDays: 60, plantSpacingMm: 50, rowSpacingMm: 150, sowMonthStart: 1, sowMonthEnd: 12 },
    { commonName: "Leek", scientificName: "Allium ampeloprasum var. porrum", family: "Amaryllidaceae", lifeCycle: "BIENNIAL", varietyName: "Musselburgh", rotationGroup: "ALLIUM", publicDescription: "A sweet, slow-growing leek, hilled up as it grows for long white shanks.", nurseryRequired: true, targetNurseryDays: 42, hardeningDays: 7, daysToGerminationTypical: 10, targetHarvestStartDays: 120, targetHarvestWindowDays: 45, plantSpacingMm: 150, rowSpacingMm: 300, sowMonthStart: 2, sowMonthEnd: 5 },
    { commonName: "Broccoli", scientificName: "Brassica oleracea var. italica", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Green Sprouting", rotationGroup: "LEAF", publicDescription: "A single-headed broccoli that keeps producing side shoots after the main cut.", nurseryRequired: true, targetNurseryDays: 35, hardeningDays: 5, daysToGerminationTypical: 6, targetHarvestStartDays: 90, targetHarvestWindowDays: 30, plantSpacingMm: 450, rowSpacingMm: 600, sowMonthStart: 2, sowMonthEnd: 5 },
    { commonName: "Cabbage", scientificName: "Brassica oleracea var. capitata", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Sugarloaf", rotationGroup: "LEAF", publicDescription: "A sweet, pointed cabbage that matures fast into a full head.", nurseryRequired: true, targetNurseryDays: 35, hardeningDays: 5, daysToGerminationTypical: 6, targetHarvestStartDays: 80, targetHarvestWindowDays: 21, plantSpacingMm: 400, rowSpacingMm: 500, sowMonthStart: 2, sowMonthEnd: 5 },
    { commonName: "Cauliflower", scientificName: "Brassica oleracea var. botrytis", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "Snowball", rotationGroup: "LEAF", publicDescription: "A tight, white-curded cauliflower that needs cool, steady growing conditions.", nurseryRequired: true, targetNurseryDays: 35, hardeningDays: 5, daysToGerminationTypical: 7, targetHarvestStartDays: 100, targetHarvestWindowDays: 21, plantSpacingMm: 500, rowSpacingMm: 600, sowMonthStart: 2, sowMonthEnd: 4 },
    { commonName: "Coriander", scientificName: "Coriandrum sativum", family: "Apiaceae", lifeCycle: "ANNUAL", varietyName: "Coriander", rotationGroup: null, publicDescription: "A fast-bolting herb best sown little and often through the cooler months.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 10, targetHarvestStartDays: 45, targetHarvestWindowDays: 21, plantSpacingMm: 100, rowSpacingMm: 200, sowMonthStart: 3, sowMonthEnd: 8 },
    { commonName: "Parsley", scientificName: "Petroselinum crispum", family: "Apiaceae", lifeCycle: "BIENNIAL", varietyName: "Flat Leaf", rotationGroup: null, publicDescription: "A slow-to-germinate but long-lasting herb that crops for months.", nurseryRequired: true, targetNurseryDays: 28, hardeningDays: 5, daysToGerminationTypical: 18, targetHarvestStartDays: 70, targetHarvestWindowDays: 120, plantSpacingMm: 200, rowSpacingMm: 250, sowMonthStart: 1, sowMonthEnd: 12 },
    { commonName: "Carrot", scientificName: "Daucus carota", family: "Apiaceae", lifeCycle: "BIENNIAL", varietyName: "Manchester Table", rotationGroup: "ROOT", publicDescription: "A sweet, straight-rooted carrot, direct sown for the best shape.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 14, targetHarvestStartDays: 75, targetHarvestWindowDays: 21, plantSpacingMm: 50, rowSpacingMm: 250, sowMonthStart: 2, sowMonthEnd: 6 },
    { commonName: "Beetroot", scientificName: "Beta vulgaris subsp. vulgaris", family: "Amaranthaceae", lifeCycle: "BIENNIAL", varietyName: "Detroit Dark Red", rotationGroup: "ROOT", publicDescription: "A sweet, deep-red beetroot, equally good roasted or grated raw.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 10, targetHarvestStartDays: 60, targetHarvestWindowDays: 30, plantSpacingMm: 100, rowSpacingMm: 250, sowMonthStart: 2, sowMonthEnd: 6 },
    { commonName: "Radish", scientificName: "Raphanus sativus", family: "Brassicaceae", lifeCycle: "ANNUAL", varietyName: "French Breakfast", rotationGroup: "ROOT", publicDescription: "The fastest crop in the garden, ready in under a month.", nurseryRequired: false, targetNurseryDays: null, hardeningDays: null, daysToGerminationTypical: 5, targetHarvestStartDays: 28, targetHarvestWindowDays: 14, plantSpacingMm: 50, rowSpacingMm: 150, sowMonthStart: 1, sowMonthEnd: 12 },
  ];

  for (const crop of marketGardenCrops) {
    const species = await db.species.upsert({
      where: { farmId_commonName: { farmId: farm.id, commonName: crop.commonName } },
      update: {},
      create: {
        farmId: farm.id,
        kingdom: "PLANT",
        commonName: crop.commonName,
        scientificName: crop.scientificName,
        family: crop.family,
        lifeCycle: crop.lifeCycle,
        primaryRole: "Food",
      },
    });

    const variety = await db.varietyBreed.upsert({
      where: { speciesId_name: { speciesId: species.id, name: crop.varietyName } },
      update: {},
      create: {
        speciesId: species.id,
        name: crop.varietyName,
        recordType: "CULTIVAR",
        rotationGroup: crop.rotationGroup ?? undefined,
        publicDescription: crop.publicDescription,
      },
    });

    const profile = await db.productionProfile.upsert({
      where: { varietyBreedId_methodId_version: { varietyBreedId: variety.id, methodId: noDigMethod.id, version: 1 } },
      update: {},
      create: {
        varietyBreedId: variety.id,
        methodId: noDigMethod.id,
        name: `${crop.varietyName} bed profile`,
        version: 1,
        nurseryRequired: crop.nurseryRequired,
        targetNurseryDays: crop.targetNurseryDays ?? undefined,
        targetHarvestStartDays: crop.targetHarvestStartDays,
        targetHarvestWindowDays: crop.targetHarvestWindowDays ?? undefined,
        sourceType: "OWN_TRIAL",
        confidenceLevel: "ESTIMATED",
      },
    });

    await db.cropProfile.upsert({
      where: { profileId: profile.id },
      update: {},
      create: {
        profileId: profile.id,
        daysToGerminationTypical: crop.daysToGerminationTypical ?? undefined,
        hardeningDays: crop.hardeningDays ?? undefined,
        daysInNursery: crop.targetNurseryDays ?? undefined,
        plantSpacingMm: crop.plantSpacingMm,
        rowSpacingMm: crop.rowSpacingMm,
        maturityBasis: crop.nurseryRequired ? "FROM_TRANSPLANT" : "FROM_SOWING",
        daysToFirstHarvest: crop.targetHarvestStartDays,
        harvestWindowDays: crop.targetHarvestWindowDays ?? undefined,
      },
    });

    await db.seasonRule.upsert({
      where: { id: `seed-season-${species.id}` },
      update: {},
      create: {
        id: `seed-season-${species.id}`,
        profileId: profile.id,
        locationOrClimateZone: "Palmwoods hinterland",
        activityType: "SOW",
        startMonth: crop.sowMonthStart,
        endMonth: crop.sowMonthEnd,
        suitability: "PREFERRED",
        notes: `Preferred sowing window for ${crop.commonName.toLowerCase()} in the subtropical hinterland.`,
      },
    });
  }

  // ---------- Poultry: species / breeds / methods / profiles / workflow ----------

  const chickenSpecies = await db.species.upsert({
    where: { farmId_commonName: { farmId: farm.id, commonName: "Chicken" } },
    update: {},
    create: {
      farmId: farm.id,
      kingdom: "ANIMAL",
      commonName: "Chicken",
      scientificName: "Gallus gallus domesticus",
      lifeCycle: "PERENNIAL",
      primaryRole: "Egg / meat",
    },
  });

  const isaBrown = await db.varietyBreed.upsert({
    where: { speciesId_name: { speciesId: chickenSpecies.id, name: "ISA Brown" } },
    update: {},
    create: {
      speciesId: chickenSpecies.id,
      name: "ISA Brown",
      recordType: "BREED",
      typicalColour: "Brown",
      publicDescription: "A reliable brown-egg layer, pasture-raised in rotating paddocks.",
    },
  });

  const cobb500 = await db.varietyBreed.upsert({
    where: { speciesId_name: { speciesId: chickenSpecies.id, name: "Cobb 500" } },
    update: {},
    create: {
      speciesId: chickenSpecies.id,
      name: "Cobb 500",
      recordType: "BREED",
      typicalColour: "White",
      publicDescription: "A fast-growing broiler breed, moved through pasture in mobile tractors.",
    },
  });

  const pasturedLayerMethod = await db.productionMethod.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Pastured layers" } },
    update: {},
    create: {
      farmId: farm.id,
      name: "Pastured layers",
      productionSystem: "LAYERS",
      internalDescription: "Mobile coop rotated across paddocks, supplemental feed.",
      publicDescription: "Our hens are rotated across fresh pasture, never kept in one place for long.",
    },
  });

  const pasturedBroilerMethod = await db.productionMethod.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Pastured broilers" } },
    update: {},
    create: {
      farmId: farm.id,
      name: "Pastured broilers",
      productionSystem: "BROILERS",
      internalDescription: "Chicken tractors moved daily across pasture.",
      publicDescription: "Broilers grow out on pasture in daily-moved tractors.",
    },
  });

  const layerProfile = await db.productionProfile.upsert({
    where: { varietyBreedId_methodId_version: { varietyBreedId: isaBrown.id, methodId: pasturedLayerMethod.id, version: 1 } },
    update: {},
    create: {
      varietyBreedId: isaBrown.id,
      methodId: pasturedLayerMethod.id,
      name: "ISA Brown pastured layer profile",
      version: 1,
      expectedYieldValue: 6,
      expectedYieldUnit: "eggs/hen/week",
      sourceType: "OWN_TRIAL",
      confidenceLevel: "ESTIMATED",
    },
  });
  await db.poultryProfile.upsert({
    where: { profileId: layerProfile.id },
    update: {},
    create: {
      profileId: layerProfile.id,
      flockType: "LAYER",
      breedName: "ISA Brown",
      broodingDays: 42,
      targetStockingDensity: 3,
      targetStockingDensityUnit: "birds/m2",
      expectedFeedConsumptionPerBirdDay: 0.12,
      expectedEggsPerHenWeek: 6,
      targetLayingStartDays: 140,
    },
  });

  const broilerProfile = await db.productionProfile.upsert({
    where: { varietyBreedId_methodId_version: { varietyBreedId: cobb500.id, methodId: pasturedBroilerMethod.id, version: 1 } },
    update: {},
    create: {
      varietyBreedId: cobb500.id,
      methodId: pasturedBroilerMethod.id,
      name: "Cobb 500 pastured broiler profile",
      version: 1,
      expectedYieldValue: 2.5,
      expectedYieldUnit: "kg live weight",
      sourceType: "OWN_TRIAL",
      confidenceLevel: "ESTIMATED",
    },
  });
  await db.poultryProfile.upsert({
    where: { profileId: broilerProfile.id },
    update: {},
    create: {
      profileId: broilerProfile.id,
      flockType: "BROILER",
      breedName: "Cobb 500",
      broodingDays: 21,
      growOutDays: 21,
      targetStockingDensity: 10,
      targetStockingDensityUnit: "birds/m2",
      expectedFeedConsumptionPerBirdDay: 0.15,
      expectedLiveWeightKg: 2.5,
      targetProcessingAgeDays: 42,
      expectedMortalityPct: 5,
    },
  });

  // Day 0 chicks arrive -> Day 21 move to grow-out tractor -> Day 42 process,
  // the same offset-day mechanism proven on the tomato/lettuce workflows.
  const broilerWorkflow = await db.workflowTemplate.upsert({
    where: { id: "seed-workflow-broiler" },
    update: {},
    create: {
      id: "seed-workflow-broiler",
      profileId: broilerProfile.id,
      name: "Cobb 500 broiler workflow",
      version: 1,
      anchorType: "SEED_DATE",
      schedulingDirection: "FORWARD",
    },
  });
  const broilerTasks: {
    taskType: "OTHER" | "MOVE" | "HARVEST";
    taskName: string;
    sequence: number;
    offsetFromAnchorDays: number;
  }[] = [
    { taskType: "OTHER", taskName: "Chicks Arrive", sequence: 1, offsetFromAnchorDays: 0 },
    { taskType: "MOVE", taskName: "Move to Grow-Out Tractor", sequence: 2, offsetFromAnchorDays: 21 },
    { taskType: "HARVEST", taskName: "Process", sequence: 3, offsetFromAnchorDays: 42 },
  ];
  for (const task of broilerTasks) {
    await db.workflowTaskTemplate.upsert({
      where: { id: `seed-task-broiler-${task.sequence}` },
      update: {},
      create: { id: `seed-task-broiler-${task.sequence}`, workflowTemplateId: broilerWorkflow.id, ...task },
    });
  }

  // ---------- Syntropic forest: species / method / profile / workflow ----------

  const bananaSpecies = await db.species.upsert({
    where: { farmId_commonName: { farmId: farm.id, commonName: "Banana" } },
    update: {},
    create: {
      farmId: farm.id,
      kingdom: "PLANT",
      commonName: "Banana",
      scientificName: "Musa acuminata",
      family: "Musaceae",
      lifeCycle: "PERENNIAL",
      primaryRole: "Food / biomass",
    },
  });

  const ladyFinger = await db.varietyBreed.upsert({
    where: { speciesId_name: { speciesId: bananaSpecies.id, name: "Lady Finger" } },
    update: {},
    create: {
      speciesId: bananaSpecies.id,
      name: "Lady Finger",
      recordType: "CULTIVAR",
      typicalColour: "Yellow",
      typicalMatureSize: "3-4m",
      publicDescription: "A sweet, thin-skinned banana grown as a fast-cycling secondary-stratum species in our forest rows.",
    },
  });

  const syntropicMethod = await db.productionMethod.upsert({
    where: { farmId_name: { farmId: farm.id, name: "Syntropic agroforestry" } },
    update: {},
    create: {
      farmId: farm.id,
      name: "Syntropic agroforestry",
      productionSystem: "FOREST",
      internalDescription: "Successional, stratified forest rows — direct-planted, chop-and-drop pruned, no bare soil.",
      publicDescription: "Grown in multi-species forest rows that mimic natural succession, building soil instead of depleting it.",
    },
  });

  const bananaProfile = await db.productionProfile.upsert({
    where: { varietyBreedId_methodId_version: { varietyBreedId: ladyFinger.id, methodId: syntropicMethod.id, version: 1 } },
    update: {},
    create: {
      varietyBreedId: ladyFinger.id,
      methodId: syntropicMethod.id,
      name: "Lady Finger forest row profile",
      version: 1,
      nurseryRequired: false,
      targetHarvestStartDays: 300,
      expectedYieldValue: 15,
      expectedYieldUnit: "kg/plant/yr",
      sourceType: "OWN_TRIAL",
      confidenceLevel: "ESTIMATED",
    },
  });

  await db.treeProfile.upsert({
    where: { profileId: bananaProfile.id },
    update: {},
    create: {
      profileId: bananaProfile.id,
      canopyStratum: "LOW",
      successionalStage: "SECONDARY",
      matureHeightM: 3.5,
      matureSpreadM: 2.5,
      withinRowSpacingM: 2,
      betweenRowSpacingM: 4,
      yearsToFirstYield: 1,
      nitrogenFixer: false,
      chopAndDropCandidate: true,
      pruningFrequencyMonths: 6,
    },
  });

  // Day 0 plant -> Day 30 mulch establishment -> Day 180 first chop-and-drop
  // prune -> Day 300 harvest start, the same offset-day mechanism proven on
  // the tomato/lettuce/broiler workflows, now stretched across a full year.
  const bananaWorkflow = await db.workflowTemplate.upsert({
    where: { id: "seed-workflow-banana" },
    update: {},
    create: {
      id: "seed-workflow-banana",
      profileId: bananaProfile.id,
      name: "Lady Finger forest row workflow",
      version: 1,
      anchorType: "SEED_DATE",
      schedulingDirection: "FORWARD",
    },
  });
  const bananaTasks: {
    taskType: "SOW" | "MULCH" | "PRUNE" | "HARVEST";
    taskName: string;
    sequence: number;
    offsetFromAnchorDays: number;
  }[] = [
    { taskType: "SOW", taskName: "Plant", sequence: 1, offsetFromAnchorDays: 0 },
    { taskType: "MULCH", taskName: "Mulch Establishment", sequence: 2, offsetFromAnchorDays: 30 },
    { taskType: "PRUNE", taskName: "First Chop-and-Drop Prune", sequence: 3, offsetFromAnchorDays: 180 },
    { taskType: "HARVEST", taskName: "Harvest Start", sequence: 4, offsetFromAnchorDays: 300 },
  ];
  for (const task of bananaTasks) {
    await db.workflowTaskTemplate.upsert({
      where: { id: `seed-task-banana-${task.sequence}` },
      update: {},
      create: { id: `seed-task-banana-${task.sequence}`, workflowTemplateId: bananaWorkflow.id, ...task },
    });
  }

  // ---------- Production areas: nursery benches + beds ----------

  for (let n = 1; n <= 2; n++) {
    await db.productionArea.upsert({
      where: { farmId_code: { farmId: farm.id, code: `NB-${n}` } },
      update: {},
      create: {
        farmId: farm.id,
        areaType: "NURSERY_BENCH",
        code: `NB-${n}`,
        name: `Nursery Bench ${n}`,
        capacity: 200,
        capacityUnit: "trays",
      },
    });
  }

  for (let x = 1; x <= 3; x++) {
    for (let y = 1; y <= 2; y++) {
      const code = `MG-B${String.fromCharCode(64 + x)}${y}`;
      await db.productionArea.upsert({
        where: { farmId_code: { farmId: farm.id, code } },
        update: {},
        create: {
          farmId: farm.id,
          areaType: "BED",
          code,
          name: `Bed ${String.fromCharCode(64 + x)}${y}`,
          gridX: x,
          gridY: y,
          lengthM: 6,
          widthM: 0.9,
          areaM2: 5.4,
        },
      });
    }
  }

  for (let n = 1; n <= 2; n++) {
    await db.productionArea.upsert({
      where: { farmId_code: { farmId: farm.id, code: `TRACTOR-${n}` } },
      update: {},
      create: {
        farmId: farm.id,
        areaType: "TRACTOR",
        code: `TRACTOR-${n}`,
        name: `Tractor ${n}`,
        capacity: 50,
        capacityUnit: "birds",
      },
    });
  }

  await db.productionArea.upsert({
    where: { farmId_code: { farmId: farm.id, code: "COOP-1" } },
    update: {},
    create: {
      farmId: farm.id,
      areaType: "COOP",
      code: "COOP-1",
      name: "Main Coop",
      capacity: 100,
      capacityUnit: "birds",
    },
  });

  for (let n = 1; n <= 3; n++) {
    await db.productionArea.upsert({
      where: { farmId_code: { farmId: farm.id, code: `PADDOCK-${n}` } },
      update: {},
      create: {
        farmId: farm.id,
        areaType: "PADDOCK",
        code: `PADDOCK-${n}`,
        name: `Paddock ${n}`,
        areaM2: 500,
      },
    });
  }

  await db.productionArea.upsert({
    where: { farmId_code: { farmId: farm.id, code: "FOREST-ROW-1" } },
    update: {},
    create: {
      farmId: farm.id,
      areaType: "FOREST_ROW",
      code: "FOREST-ROW-1",
      name: "Forest Row 1",
      lengthM: 30,
      widthM: 4,
      areaM2: 120,
    },
  });

  // ---------- Inventory ----------

  const tomatoSeedItem = await db.item.upsert({
    where: { farmId_code: { farmId: farm.id, code: "SEED-ROMA" } },
    update: {},
    create: {
      farmId: farm.id,
      itemType: "SEED",
      code: "SEED-ROMA",
      name: "Roma tomato seed",
      defaultUnit: "seeds",
    },
  });
  await db.inventoryLot.upsert({
    where: { itemId_lotCode: { itemId: tomatoSeedItem.id, lotCode: "SL-0001" } },
    update: {},
    create: {
      itemId: tomatoSeedItem.id,
      lotCode: "SL-0001",
      quantityReceived: 500,
      quantityRemaining: 500,
      unit: "seeds",
      unitCost: 0.05,
      storageArea: "Seed fridge",
    },
  });

  const lettuceSeedItem = await db.item.upsert({
    where: { farmId_code: { farmId: farm.id, code: "SEED-BUTTERHEAD" } },
    update: {},
    create: {
      farmId: farm.id,
      itemType: "SEED",
      code: "SEED-BUTTERHEAD",
      name: "Butterhead lettuce seed",
      defaultUnit: "seeds",
    },
  });
  await db.inventoryLot.upsert({
    where: { itemId_lotCode: { itemId: lettuceSeedItem.id, lotCode: "SL-0002" } },
    update: {},
    create: {
      itemId: lettuceSeedItem.id,
      lotCode: "SL-0002",
      quantityReceived: 1000,
      quantityRemaining: 1000,
      unit: "seeds",
      unitCost: 0.02,
      storageArea: "Seed fridge",
    },
  });

  const compostItem = await db.item.upsert({
    where: { farmId_code: { farmId: farm.id, code: "COMPOST" } },
    update: {},
    create: { farmId: farm.id, itemType: "COMPOST", code: "COMPOST", name: "Farm compost", defaultUnit: "kg" },
  });
  await db.inventoryLot.upsert({
    where: { itemId_lotCode: { itemId: compostItem.id, lotCode: "CL-0001" } },
    update: {},
    create: {
      itemId: compostItem.id,
      lotCode: "CL-0001",
      quantityReceived: 500,
      quantityRemaining: 500,
      unit: "kg",
      unitCost: 2.5,
      storageArea: "Compost bay",
    },
  });

  const feedItem = await db.item.upsert({
    where: { farmId_code: { farmId: farm.id, code: "FEED-LAYER" } },
    update: {},
    create: { farmId: farm.id, itemType: "FEED", code: "FEED-LAYER", name: "Layer feed pellets", defaultUnit: "kg" },
  });
  await db.inventoryLot.upsert({
    where: { itemId_lotCode: { itemId: feedItem.id, lotCode: "FL-0001" } },
    update: {},
    create: {
      itemId: feedItem.id,
      lotCode: "FL-0001",
      quantityReceived: 200,
      quantityRemaining: 200,
      unit: "kg",
      unitCost: 1.2,
      storageArea: "Feed shed",
    },
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
