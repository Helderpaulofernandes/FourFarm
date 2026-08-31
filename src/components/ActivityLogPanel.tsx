type Input = { quantity: number; unit: string; inventoryLot: { item: { name: string } } };
type Activity = {
  id: string;
  activityType: string;
  status: string;
  actualEndDateTime: Date | string | null;
  plannedDateTime: Date | string | null;
  internalNotes: string | null;
  inputs: Input[];
};
type Harvest = { id: string; harvestLotCode: string; grossQuantity: number; unit: string; harvestDateTime: Date | string };

type LogEntry = { id: string; date: Date; label: string; detail?: string };

export function ActivityLogPanel({ activities, harvests }: { activities: Activity[]; harvests: Harvest[] }) {
  const entries: LogEntry[] = [];

  for (const a of activities) {
    if (a.status !== "DONE" || !a.actualEndDateTime) continue;
    const detailParts: string[] = [];
    if (a.inputs.length > 0) {
      detailParts.push(...a.inputs.map((i) => `${i.quantity}${i.unit} ${i.inventoryLot.item.name}`));
    }
    if (a.internalNotes && a.inputs.length === 0) detailParts.push(a.internalNotes);
    entries.push({
      id: a.id,
      date: new Date(a.actualEndDateTime),
      label: a.internalNotes && a.inputs.length > 0 ? a.internalNotes : a.activityType.replace(/_/g, " "),
      detail: detailParts.join(", ") || undefined,
    });
  }

  for (const h of harvests) {
    entries.push({
      id: h.id,
      date: new Date(h.harvestDateTime),
      label: "Harvest",
      detail: `${h.grossQuantity}${h.unit} (${h.harvestLotCode})`,
    });
  }

  entries.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-medium text-stone-500">Activity log</h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="border-b border-stone-100 pb-2 last:border-0 last:pb-0">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium capitalize text-stone-900">{entry.label.toLowerCase()}</span>
              <span className="text-xs text-stone-400">{entry.date.toLocaleDateString()}</span>
            </div>
            {entry.detail && <div className="text-sm text-stone-600">{entry.detail}</div>}
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-stone-400">Nothing logged yet.</p>}
      </div>
    </div>
  );
}
