import { listItems } from "@/server/actions/inventory";
import { ItemForm } from "@/components/ItemForm";
import { InventoryLotForm } from "@/components/InventoryLotForm";

export default async function InventoryPage() {
  const items = await listItems();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Inventory</h1>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ItemForm />
        <InventoryLotForm items={items.map((i) => ({ id: i.id, name: i.name, defaultUnit: i.defaultUnit }))} />
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="font-medium text-stone-900">{item.name}</div>
            <div className="text-sm text-stone-500">{item.itemType.toLowerCase()}</div>
            {item.lots.length > 0 && (
              <div className="mt-2 space-y-1">
                {item.lots.map((lot) => (
                  <div key={lot.id} className="text-sm text-stone-600">
                    {lot.lotCode}: {lot.quantityRemaining}/{lot.quantityReceived} {lot.unit} — {lot.status.toLowerCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-stone-500">No inventory items yet.</p>}
      </div>
    </div>
  );
}
