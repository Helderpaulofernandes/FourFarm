import { getPublicFarmOverview } from "@/server/actions/transparency";

function label(value: string) {
  return value.toLowerCase().replace(/_/g, " ");
}

export default async function TransparencyPage() {
  const { farm, methods, batchCounts, areaCounts } = await getPublicFarmOverview();
  const totalGrowing = batchCounts.reduce((sum, b) => sum + b.count, 0);
  const totalAreas = areaCounts.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">How We Grow</h1>
      <p className="mt-1 text-stone-500">
        {farm.name}
        {farm.climateZone ? ` — ${farm.climateZone}` : ""}
      </p>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-stone-500">What&apos;s growing right now</h2>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-stone-900">{totalGrowing}</div>
            <div className="text-xs text-stone-500">batches in production</div>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-stone-900">{totalAreas}</div>
            <div className="text-xs text-stone-500">growing areas</div>
          </div>
          {batchCounts.map((b) => (
            <div key={b.enterpriseType} className="rounded-xl border border-stone-200 bg-white p-4 text-center">
              <div className="text-2xl font-semibold text-stone-900">{b.count}</div>
              <div className="text-xs capitalize text-stone-500">{label(b.enterpriseType)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-stone-500">Our growing methods</h2>
        <div className="mt-2 space-y-4">
          {methods.map((method) => (
            <div key={method.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="font-medium text-stone-900">{method.name}</div>
              <div className="text-xs capitalize text-stone-400">{label(method.productionSystem)}</div>
              <p className="mt-2 text-stone-700">{method.publicDescription}</p>
            </div>
          ))}
          {methods.length === 0 && <p className="text-sm text-stone-500">No growing methods published yet.</p>}
        </div>
      </div>
    </div>
  );
}
