"use client";

import { useState } from "react";
import { VarietyBreedForm } from "@/components/VarietyBreedForm";

type Profile = {
  id: string;
  name: string;
  version: number;
  nurseryRequired: boolean;
  targetNurseryDays: number | null;
  targetHarvestStartDays: number | null;
  method: { name: string };
  cropProfile: { plantSpacingMm: number | null; rowSpacingMm: number | null } | null;
  poultryProfile: {
    flockType: string;
    breedName: string | null;
    broodingDays: number | null;
    growOutDays: number | null;
    expectedEggsPerHenWeek: number | null;
    expectedLiveWeightKg: number | null;
  } | null;
  workflowTemplates: { id: string }[];
};
type Variety = {
  id: string;
  speciesId: string;
  name: string;
  rotationGroup: string | null;
  profiles: Profile[];
};
type SpeciesOption = { id: string; commonName: string };

export function VarietyRow({ variety, speciesOptions }: { variety: Variety; speciesOptions: SpeciesOption[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <VarietyBreedForm
        species={speciesOptions}
        existing={{ id: variety.id, speciesId: variety.speciesId, name: variety.name, rotationGroup: (variety.rotationGroup as never) ?? undefined }}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-lg bg-stone-50 p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-stone-800">{variety.name}</span>
        <div className="flex items-center gap-2">
          {variety.rotationGroup && (
            <span className="rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-600">{variety.rotationGroup.toLowerCase()}</span>
          )}
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-green-700 underline">
            Edit
          </button>
        </div>
      </div>
      {variety.profiles.map((p) => (
        <div key={p.id} className="mt-2 text-sm text-stone-600">
          <span className="font-medium">{p.name}</span> ({p.method.name}) — v{p.version}
          {p.cropProfile && (
            <span>
              {" "}
              · {p.nurseryRequired ? `${p.targetNurseryDays}d nursery, ` : ""}
              harvest ~{p.targetHarvestStartDays}d · {p.cropProfile.plantSpacingMm}×{p.cropProfile.rowSpacingMm}mm spacing
            </span>
          )}
          {p.poultryProfile && (
            <span>
              {" "}
              · {p.poultryProfile.flockType.toLowerCase()}
              {p.poultryProfile.breedName ? ` (${p.poultryProfile.breedName})` : ""}
              {p.poultryProfile.broodingDays ? ` · ${p.poultryProfile.broodingDays}d brooding` : ""}
              {p.poultryProfile.growOutDays ? ` · ${p.poultryProfile.growOutDays}d grow-out` : ""}
              {p.poultryProfile.expectedEggsPerHenWeek ? ` · ${p.poultryProfile.expectedEggsPerHenWeek} eggs/hen/wk` : ""}
              {p.poultryProfile.expectedLiveWeightKg ? ` · ${p.poultryProfile.expectedLiveWeightKg}kg target` : ""}
            </span>
          )}
          {p.workflowTemplates.length > 0 && <span> · {p.workflowTemplates.length} workflow template(s)</span>}
        </div>
      ))}
      {variety.profiles.length === 0 && <p className="mt-1 text-xs text-stone-400">No production profile yet.</p>}
    </div>
  );
}
