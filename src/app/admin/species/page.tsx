import { listSpecies, listVarietyBreeds, listProductionMethods } from "@/server/actions/species";
import { SpeciesForm } from "@/components/SpeciesForm";
import { VarietyBreedForm } from "@/components/VarietyBreedForm";
import { CropProfileForm } from "@/components/CropProfileForm";
import { PoultryProfileForm } from "@/components/PoultryProfileForm";
import { SpeciesRow } from "@/components/SpeciesRow";

export default async function SpeciesPage() {
  const [species, varieties, methods] = await Promise.all([
    listSpecies(),
    listVarietyBreeds(),
    listProductionMethods(),
  ]);
  const speciesOptions = species.map((s) => ({ id: s.id, commonName: s.commonName }));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Species & Varieties</h1>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SpeciesForm />
        <VarietyBreedForm species={speciesOptions} />
      </div>
      <CropProfileForm varieties={varieties} methods={methods} />
      <PoultryProfileForm varieties={varieties} methods={methods} />

      <div className="space-y-4">
        {species.map((sp) => (
          <SpeciesRow key={sp.id} species={sp} allSpecies={speciesOptions} />
        ))}
        {species.length === 0 && <p className="text-sm text-stone-500">No species yet.</p>}
      </div>
    </div>
  );
}
