"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductionAreaForm } from "@/components/ProductionAreaForm";

type Area = {
  id: string;
  areaType: string;
  code: string;
  name: string;
  gridX: number | null;
  gridY: number | null;
  batchLocations: { batch: { id: string; batchCode: string; varietyBreed: { name: string } } }[];
};

export function AreaRow({ area }: { area: Area }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ProductionAreaForm
        existing={{
          id: area.id,
          areaType: area.areaType as never,
          code: area.code,
          name: area.name,
          gridX: area.gridX ?? undefined,
          gridY: area.gridY ?? undefined,
        }}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
      <div>
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
      <button onClick={() => setEditing(true)} className="h-9 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700">
        Edit
      </button>
    </div>
  );
}
