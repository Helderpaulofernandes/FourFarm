import { listSpecies, listVarietyBreeds, listProductionMethods } from "@/server/actions/species";
import { SpeciesForm } from "@/components/SpeciesForm";
import { VarietyBreedForm } from "@/components/VarietyBreedForm";
import { CropProfileForm } from "@/components/CropProfileForm";

export default async function SpeciesPage() {
  const [species, varieties, methods] = await Promise.all([
    listSpecies(),
    listVarietyBreeds(),
    listProductionMethods(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Species & Varieties</h1>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SpeciesForm />
        <VarietyBreedForm species={species.map((s) => ({ id: s.id, commonName: s.commonName }))} />
      </div>
      <CropProfileForm varieties={varieties} methods={methods} />

      <div className="space-y-4">
        {species.map((sp) => (
          <div key={sp.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="font-medium text-stone-900">
              {sp.commonName} <span className="text-sm text-stone-500">({sp.kingdom.toLowerCase()})</span>
            </div>
            {sp.scientificName && <div className="text-sm italic text-stone-500">{sp.scientificName}</div>}

            <div className="mt-3 space-y-3">
              {sp.varieties.map((v) => (
                <div key={v.id} className="rounded-lg bg-stone-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-800">{v.name}</span>
                    {v.rotationGroup && (
                      <span className="rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-600">
                        {v.rotationGroup.toLowerCase()}
                      </span>
                    )}
                  </div>
                  {v.profiles.map((p) => (
                    <div key={p.id} className="mt-2 text-sm text-stone-600">
                      <span className="font-medium">{p.name}</span> ({p.method.name}) — v{p.version} ·{" "}
                      {p.nurseryRequired ? `${p.targetNurseryDays}d nursery, ` : ""}
                      harvest ~{p.targetHarvestStartDays}d
                      {p.cropProfile && (
                        <span>
                          {" "}
                          · {p.cropProfile.plantSpacingMm}×{p.cropProfile.rowSpacingMm}mm spacing
                        </span>
                      )}
                      {p.workflowTemplates.length > 0 && (
                        <span> · {p.workflowTemplates.length} workflow template(s)</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {sp.varieties.length === 0 && <p className="text-sm text-stone-400">No varieties yet.</p>}
            </div>
          </div>
        ))}
        {species.length === 0 && <p className="text-sm text-stone-500">No species yet.</p>}
      </div>
    </div>
  );
}
