import { getGrowingUnit } from "@/server/actions/growing-units";
import { listCrops } from "@/server/actions/crops";
import { listInputMaterials } from "@/server/actions/inputs";
import { OccupancyStarter } from "@/components/OccupancyStarter";
import { LifecycleEventLogger } from "@/components/LifecycleEventLogger";
import { InputApplicationLogger } from "@/components/InputApplicationLogger";
import { EndOccupancyButton } from "@/components/EndOccupancyButton";

export default async function GrowingUnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [unit, crops, materials] = await Promise.all([
    getGrowingUnit(id),
    listCrops(),
    listInputMaterials(),
  ]);

  const activeOccupancy = unit.occupancies.find((o) => o.status === "ACTIVE");
  const pastOccupancies = unit.occupancies.filter((o) => o.status !== "ACTIVE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-stone-900">{unit.label}</h1>
        <p className="text-sm text-stone-500">
          {unit.unitType.toLowerCase()} · {unit.status.toLowerCase()}
          {unit.gridX && unit.gridY ? ` · (${unit.gridX}, ${unit.gridY})` : ""}
        </p>
      </div>

      {activeOccupancy ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-green-300 bg-green-50 p-4">
            <div>
              <div className="font-medium text-stone-900">
                {activeOccupancy.cropPlanting?.crop.name ?? "Bird batch"} (succession #
                {activeOccupancy.successionNo})
              </div>
              <div className="text-sm text-stone-600">
                Started {new Date(activeOccupancy.startedAt).toLocaleDateString()}
              </div>
            </div>
            <EndOccupancyButton occupancyId={activeOccupancy.id} growingUnitId={unit.id} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">Log an event</h2>
            <LifecycleEventLogger occupancyId={activeOccupancy.id} growingUnitId={unit.id} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">Log an input application</h2>
            <InputApplicationLogger
              occupancyId={activeOccupancy.id}
              growingUnitId={unit.id}
              materials={materials}
            />
          </div>

          {activeOccupancy.events.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-stone-500">Recent events</h2>
              <div className="space-y-1">
                {activeOccupancy.events.map((e) => (
                  <div key={e.id} className="rounded-lg bg-white p-3 text-sm">
                    <span className="font-medium text-stone-900">{e.eventType}</span>{" "}
                    <span className="text-stone-500">
                      {new Date(e.occurredAt).toLocaleString()}
                    </span>
                    {e.notes && <div className="text-stone-600">{e.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeOccupancy.inputApplications.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-stone-500">Input applications</h2>
              <div className="space-y-1">
                {activeOccupancy.inputApplications.map((a) => (
                  <div key={a.id} className="rounded-lg bg-white p-3 text-sm">
                    {a.quantity} {a.inputMaterial.unit} {a.inputMaterial.name} — R{a.costSnapshot.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <OccupancyStarter growingUnitId={unit.id} unitType={unit.unitType} crops={crops} />
      )}

      {pastOccupancies.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-stone-500">History</h2>
          <div className="space-y-1">
            {pastOccupancies.map((o) => (
              <div key={o.id} className="rounded-lg bg-white p-3 text-sm text-stone-600">
                {o.cropPlanting?.crop.name ?? "Bird batch"} · succession #{o.successionNo} ·{" "}
                {new Date(o.startedAt).toLocaleDateString()} –{" "}
                {o.endedAt ? new Date(o.endedAt).toLocaleDateString() : "?"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
