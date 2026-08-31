import Link from "next/link";
import { listProductionAreas } from "@/server/actions/production-areas";
import { ProductionAreaForm } from "@/components/ProductionAreaForm";

export default async function AreasPage() {
  const areas = await listProductionAreas();
  const gridAreas = areas.filter((a) => a.gridX && a.gridY);
  const maxX = Math.max(1, ...gridAreas.map((a) => a.gridX ?? 0));
  const maxY = Math.max(1, ...gridAreas.map((a) => a.gridY ?? 0));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Production areas</h1>
      <ProductionAreaForm />

      {gridAreas.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-stone-500">Layout</h2>
          <div className="grid gap-2 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${maxX}, minmax(90px, 1fr))` }}>
            {Array.from({ length: maxY }).map((_, rowIdx) =>
              Array.from({ length: maxX }).map((_, colIdx) => {
                const x = colIdx + 1;
                const y = rowIdx + 1;
                const area = gridAreas.find((a) => a.gridX === x && a.gridY === y);
                if (!area) return <div key={`${x}-${y}`} />;
                const occupied = area.batchLocations[0];
                return (
                  <div
                    key={area.id}
                    className={`rounded-lg border p-3 text-center ${occupied ? "border-green-300 bg-green-50" : "border-stone-200 bg-white"}`}
                  >
                    <div className="text-sm font-medium text-stone-900">{area.name}</div>
                    <div className="text-xs text-stone-500">
                      {occupied ? occupied.batch.varietyBreed.name : "available"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-medium text-stone-500">All areas</h2>
        <div className="space-y-2">
          {areas.map((area) => (
            <div key={area.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="font-medium text-stone-900">{area.name}</div>
              <div className="text-sm text-stone-500">
                {area.areaType.toLowerCase().replace("_", " ")} · {area.code}
                {area.batchLocations[0] && (
                  <>
                    {" "}
                    ·{" "}
                    <Link href={`/admin/batches/${area.batchLocations[0].batch.id}`} className="text-green-700 underline">
                      {area.batchLocations[0].batch.varietyBreed.name} ({area.batchLocations[0].batch.batchCode})
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
          {areas.length === 0 && <p className="text-sm text-stone-500">No production areas yet.</p>}
        </div>
      </div>
    </div>
  );
}
