"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "@/server/actions/production-batches";
import { AREA_TYPES_BY_SYSTEM } from "@/lib/production-system";

type Profile = {
  id: string;
  name: string;
  nurseryRequired: boolean;
  method: { productionSystem: string };
  workflowTemplates: { id: string; name: string }[];
};
type Variety = { id: string; name: string; species: { commonName: string }; profiles: Profile[] };
type Area = { id: string; name: string; areaType: string };

function defaultQuantityUnit(productionSystem?: string) {
  return productionSystem === "LAYERS" || productionSystem === "BROILERS" ? "birds" : "plants";
}

export function BatchForm({ varieties, areas }: { varieties: Variety[]; areas: Area[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [varietyId, setVarietyId] = useState(varieties[0]?.id ?? "");
  const [profileId, setProfileId] = useState(varieties[0]?.profiles[0]?.id ?? "");
  const [areaId, setAreaId] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState(defaultQuantityUnit(varieties[0]?.profiles[0]?.method.productionSystem));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedVariety = varieties.find((v) => v.id === varietyId);
  const profiles = selectedVariety?.profiles ?? [];
  const selectedProfile = profiles.find((p) => p.id === profileId);

  const suggestedAreas = useMemo(() => {
    if (!selectedProfile) return areas;
    const system = selectedProfile.method.productionSystem;
    const types = AREA_TYPES_BY_SYSTEM[system] ?? (selectedProfile.nurseryRequired ? ["NURSERY_BENCH"] : ["BED"]);
    return areas.filter((a) => types.includes(a.areaType));
  }, [selectedProfile, areas]);

  function selectProfile(profile: Profile | undefined) {
    setProfileId(profile?.id ?? "");
    setUnit(defaultQuantityUnit(profile?.method.productionSystem));
    setAreaId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createBatch({
        varietyBreedId: varietyId,
        profileId,
        workflowTemplateId: selectedProfile?.workflowTemplates[0]?.id,
        areaId: areaId || suggestedAreas[0]?.id,
        startedAt: new Date(),
        initialQuantity: Number(quantity),
        quantityUnit: unit,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (varieties.length === 0) {
    return <p className="text-sm text-stone-500">Add a species, variety and production profile first.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 sm:w-auto sm:px-6"
      >
        + Start a batch
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Variety</label>
          <select
            value={varietyId}
            onChange={(e) => {
              setVarietyId(e.target.value);
              const v = varieties.find((x) => x.id === e.target.value);
              selectProfile(v?.profiles[0]);
            }}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          >
            {varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.species.commonName} — {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Profile</label>
          <select
            value={profileId}
            onChange={(e) => selectProfile(profiles.find((p) => p.id === e.target.value))}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Starting area</label>
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            {suggestedAreas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium text-stone-700">Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Unit</label>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Starting..." : "Start batch"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
