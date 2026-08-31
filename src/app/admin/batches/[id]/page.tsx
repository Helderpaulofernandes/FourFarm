import { getBatch } from "@/server/actions/production-batches";
import { listProductionAreas } from "@/server/actions/production-areas";
import { listAvailableLots } from "@/server/actions/inventory";
import { BatchTimeline } from "@/components/BatchTimeline";
import { ActivityLogger } from "@/components/ActivityLogger";
import { ActivityInputLogger } from "@/components/ActivityInputLogger";
import { HarvestForm } from "@/components/HarvestForm";
import { CompleteBatchButton } from "@/components/CompleteBatchButton";
import { ActivityLogPanel } from "@/components/ActivityLogPanel";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [batch, areas, lots] = await Promise.all([getBatch(id), listProductionAreas(), listAvailableLots()]);

  const beds = areas.filter((a) => a.areaType === "BED");
  const currentLocation = batch.locations.find((l) => !l.endDateTime);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">
            {batch.varietyBreed.species.commonName} — {batch.varietyBreed.name}
          </h1>
          <p className="text-sm text-stone-500">
            {batch.batchCode} · {batch.status.toLowerCase().replace(/_/g, " ")}
            {currentLocation && ` · ${currentLocation.area.name}`}
          </p>
        </div>
        {batch.status !== "COMPLETED" && batch.status !== "ABANDONED" && <CompleteBatchButton batchId={batch.id} />}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-stone-500">Sow-to-harvest timeline</h2>
        <BatchTimeline batchId={batch.id} activities={batch.activities} beds={beds} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">Log an activity</h2>
            <ActivityLogger batchId={batch.id} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">Log an input</h2>
            <ActivityInputLogger batchId={batch.id} lots={lots} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">Log a harvest</h2>
            <HarvestForm batchId={batch.id} defaultUnit={batch.profile?.expectedYieldUnit?.split("/")[0] ?? "kg"} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">Location history</h2>
            <div className="space-y-1">
              {batch.locations.map((loc) => (
                <div key={loc.id} className="rounded-lg bg-white p-3 text-sm text-stone-600">
                  {loc.area.name} ({loc.placementType.toLowerCase()}) · {new Date(loc.startDateTime).toLocaleDateString()} –{" "}
                  {loc.endDateTime ? new Date(loc.endDateTime).toLocaleDateString() : "current"}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <ActivityLogPanel activities={batch.activities} harvests={batch.harvests} />
        </div>
      </div>
    </div>
  );
}
