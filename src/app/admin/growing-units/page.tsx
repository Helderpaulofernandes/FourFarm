import Link from "next/link";
import { listGrowingUnits } from "@/server/actions/growing-units";
import { GrowingUnitForm } from "@/components/GrowingUnitForm";

const statusColor: Record<string, string> = {
  AVAILABLE: "bg-white border-stone-200",
  OCCUPIED: "bg-green-50 border-green-300",
  RESTING: "bg-amber-50 border-amber-300",
  INACTIVE: "bg-stone-100 border-stone-300",
};

export default async function GrowingUnitsPage() {
  const units = await listGrowingUnits();
  const maxX = Math.max(1, ...units.map((u) => u.gridX ?? 0));
  const maxY = Math.max(1, ...units.map((u) => u.gridY ?? 0));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Beds & tractors</h1>
      <GrowingUnitForm />

      <div>
        <h2 className="mb-2 text-sm font-medium text-stone-500">Farm layout</h2>
        <div
          className="grid gap-2 overflow-x-auto"
          style={{ gridTemplateColumns: `repeat(${maxX}, minmax(90px, 1fr))` }}
        >
          {Array.from({ length: maxY }).map((_, rowIdx) =>
            Array.from({ length: maxX }).map((_, colIdx) => {
              const x = colIdx + 1;
              const y = rowIdx + 1;
              const unit = units.find((u) => u.gridX === x && u.gridY === y);
              if (!unit) return <div key={`${x}-${y}`} />;
              return (
                <Link
                  key={unit.id}
                  href={`/admin/growing-units/${unit.id}`}
                  className={`rounded-lg border p-3 text-center active:opacity-80 ${statusColor[unit.status]}`}
                >
                  <div className="text-sm font-medium text-stone-900">{unit.label}</div>
                  <div className="text-xs text-stone-500">
                    {unit.occupancies[0]?.cropPlanting?.crop.name ?? unit.status.toLowerCase()}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-stone-500">All units</h2>
        <div className="space-y-2">
          {units.map((unit) => (
            <Link
              key={unit.id}
              href={`/admin/growing-units/${unit.id}`}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 active:bg-stone-100"
            >
              <div>
                <div className="font-medium text-stone-900">{unit.label}</div>
                <div className="text-sm text-stone-500">
                  {unit.unitType.toLowerCase()} · {unit.status.toLowerCase()}
                  {unit.occupancies[0]?.cropPlanting
                    ? ` · ${unit.occupancies[0].cropPlanting.crop.name}`
                    : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
