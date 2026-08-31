import Link from "next/link";
import { listBatches } from "@/server/actions/production-batches";
import { listVarietyBreeds } from "@/server/actions/species";
import { listProductionAreas } from "@/server/actions/production-areas";
import { BatchForm } from "@/components/BatchForm";

const statusColor: Record<string, string> = {
  PLANNED: "bg-stone-100 text-stone-600",
  SEEDED: "bg-blue-100 text-blue-700",
  IN_NURSERY: "bg-blue-100 text-blue-700",
  READY_TO_TRANSPLANT: "bg-amber-100 text-amber-700",
  TRANSPLANTED: "bg-green-100 text-green-700",
  GROWING: "bg-green-100 text-green-700",
  HARVESTING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-stone-200 text-stone-600",
  ABANDONED: "bg-red-100 text-red-700",
};

export default async function BatchesPage() {
  const [batches, varieties, areas] = await Promise.all([listBatches(), listVarietyBreeds(), listProductionAreas()]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Production batches</h1>
      <BatchForm varieties={varieties} areas={areas} />

      <div className="space-y-2">
        {batches.map((batch) => (
          <Link
            key={batch.id}
            href={`/admin/batches/${batch.id}`}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 active:bg-stone-100"
          >
            <div>
              <div className="font-medium text-stone-900">
                {batch.varietyBreed.species.commonName} — {batch.varietyBreed.name}
              </div>
              <div className="text-sm text-stone-500">
                {batch.batchCode}
                {batch.locations[0] && ` · ${batch.locations[0].area.name}`}
              </div>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[batch.status]}`}>
              {batch.status.toLowerCase().replace(/_/g, " ")}
            </span>
          </Link>
        ))}
        {batches.length === 0 && <p className="text-sm text-stone-500">No batches yet.</p>}
      </div>
    </div>
  );
}
