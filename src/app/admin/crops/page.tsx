import { listCrops, listProtectionMethods } from "@/server/actions/crops";
import { CropForm } from "@/components/CropForm";

export default async function CropsPage() {
  const [crops, protectionMethods] = await Promise.all([listCrops(), listProtectionMethods()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">Crops</h1>
      </div>

      <CropForm protectionMethods={protectionMethods} />

      <div className="space-y-2">
        {crops.map((crop) => (
          <div key={crop.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-stone-900">
                  {crop.name}
                  {crop.variety ? ` — ${crop.variety}` : ""}
                </div>
                <div className="text-sm text-stone-500">
                  {crop.propagationMethod.replace("_", " ").toLowerCase()} · {crop.daysToMaturityMin}
                  –{crop.daysToMaturityMax} days · {crop.spacingCm}cm spacing
                </div>
              </div>
            </div>
            {crop.protectionMethods.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {crop.protectionMethods.map((cpm) => (
                  <span
                    key={cpm.id}
                    className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-600"
                  >
                    {cpm.protectionMethod.name}
                    {cpm.season ? ` (${cpm.season.toLowerCase()})` : ""}
                  </span>
                ))}
              </div>
            )}
            {crop.seasonalMultipliers.length > 0 && (
              <div className="mt-2 text-xs text-stone-500">
                {crop.seasonalMultipliers
                  .map((m) => `${m.season.toLowerCase()} ×${m.multiplier}`)
                  .join(" · ")}
              </div>
            )}
          </div>
        ))}
        {crops.length === 0 && <p className="text-sm text-stone-500">No crops yet.</p>}
      </div>
    </div>
  );
}
