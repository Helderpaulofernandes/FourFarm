import { listInputMaterials } from "@/server/actions/inputs";
import { InputMaterialForm } from "@/components/InputMaterialForm";

export default async function InputsPage() {
  const materials = await listInputMaterials();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Input materials</h1>
      <InputMaterialForm />

      <div className="space-y-2">
        {materials.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
          >
            <div>
              <div className="font-medium text-stone-900">{m.name}</div>
              <div className="text-sm text-stone-500">{m.category.toLowerCase()}</div>
            </div>
            <div className="text-sm text-stone-700">
              {m.costPerUnit.toFixed(2)} / {m.unit}
            </div>
          </div>
        ))}
        {materials.length === 0 && <p className="text-sm text-stone-500">No input materials yet.</p>}
      </div>
    </div>
  );
}
