import { listItems } from "@/server/actions/inventory";
import { ItemForm } from "@/components/ItemForm";
import { InventoryLotForm } from "@/components/InventoryLotForm";
import { ItemRow } from "@/components/ItemRow";

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
          <ItemRow key={item.id} item={item} />
        ))}
        {items.length === 0 && <p className="text-sm text-stone-500">No inventory items yet.</p>}
      </div>
    </div>
  );
}
