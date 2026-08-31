// Which ProductionArea types make sense as a batch's starting or destination
// area for a given production system. Falls back to nursery-bench/bed logic
// (see callers) for MARKET_GARDEN/NURSERY, which don't need a fixed area type.
export const AREA_TYPES_BY_SYSTEM: Record<string, string[]> = {
  LAYERS: ["COOP", "TRACTOR", "PADDOCK"],
  BROILERS: ["COOP", "TRACTOR", "PADDOCK"],
  FOREST: ["FOREST_ROW"],
};
