import { getFarmSettings } from "@/server/actions/farm";
import { FarmSettingsForm } from "@/components/FarmSettingsForm";

export default async function FarmSettingsPage() {
  const farm = await getFarmSettings();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-stone-900">Farm Settings</h1>
      <FarmSettingsForm
        existing={{
          name: farm.name,
          climateZone: farm.climateZone ?? undefined,
          publicStory: farm.publicStory ?? undefined,
          heroImageUrl: farm.heroImageUrl ?? undefined,
        }}
      />
    </div>
  );
}
