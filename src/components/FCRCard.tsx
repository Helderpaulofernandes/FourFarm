type Input = { quantity: number; unit: string; inventoryLot: { item: { itemType: string } } };
type Activity = { inputs: Input[] };
type Harvest = { grossQuantity: number; unit: string };

// Feed conversion ratio, computed on the fly rather than stored: total feed
// consumed (kg) divided by total output (eggs or live/dressed weight,
// whatever unit the harvest log uses). Simple and transparent rather than
// trying to normalise units the farmer already understands in context.
export function FCRCard({ activities, harvests }: { activities: Activity[]; harvests: Harvest[] }) {
  const totalFeed = activities
    .flatMap((a) => a.inputs)
    .filter((i) => i.inventoryLot.item.itemType === "FEED")
    .reduce((sum, i) => sum + i.quantity, 0);

  const totalOutput = harvests.reduce((sum, h) => sum + h.grossQuantity, 0);
  const outputUnit = harvests[0]?.unit ?? "";

  if (totalFeed === 0 || totalOutput === 0) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-medium text-stone-500">Feed conversion</h2>
      <div className="text-2xl font-semibold text-stone-900">{(totalFeed / totalOutput).toFixed(3)}</div>
      <div className="text-sm text-stone-500">
        kg feed per {outputUnit || "unit"} output — {totalFeed}kg fed / {totalOutput}
        {outputUnit} produced
      </div>
    </div>
  );
}
