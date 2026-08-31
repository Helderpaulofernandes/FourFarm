"use client";

import { useState } from "react";
import { SpeciesForm } from "@/components/SpeciesForm";
import { VarietyRow } from "@/components/VarietyRow";

type Variety = Parameters<typeof VarietyRow>[0]["variety"];
type Species = {
  id: string;
  kingdom: string;
  commonName: string;
  scientificName: string | null;
  family: string | null;
  primaryRole: string | null;
  varieties: Variety[];
};

export function SpeciesRow({ species, allSpecies }: { species: Species; allSpecies: { id: string; commonName: string }[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <SpeciesForm
        existing={{
          id: species.id,
          kingdom: species.kingdom as never,
          commonName: species.commonName,
          scientificName: species.scientificName ?? undefined,
          family: species.family ?? undefined,
          primaryRole: species.primaryRole ?? undefined,
        }}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-stone-900">{species.commonName}</span>{" "}
          <span className="text-sm text-stone-500">({species.kingdom.toLowerCase()})</span>
          {species.scientificName && <div className="text-sm italic text-stone-500">{species.scientificName}</div>}
        </div>
        <button onClick={() => setEditing(true)} className="h-9 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700">
          Edit
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {species.varieties.map((v) => (
          <VarietyRow key={v.id} variety={v} speciesOptions={allSpecies} />
        ))}
        {species.varieties.length === 0 && <p className="text-sm text-stone-400">No varieties yet.</p>}
      </div>
    </div>
  );
}
