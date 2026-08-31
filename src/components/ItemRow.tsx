"use client";

import { useState } from "react";
import { ItemForm } from "@/components/ItemForm";

type Lot = { id: string; lotCode: string; unit: string; quantityRemaining: number; quantityReceived: number; status: string };
type Item = { id: string; itemType: string; code: string; name: string; defaultUnit: string; lots: Lot[] };

export function ItemRow({ item }: { item: Item }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ItemForm
        existing={{ id: item.id, itemType: item.itemType as never, code: item.code, name: item.name, defaultUnit: item.defaultUnit }}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-stone-900">{item.name}</div>
          <div className="text-sm text-stone-500">{item.itemType.toLowerCase()}</div>
        </div>
        <button onClick={() => setEditing(true)} className="h-9 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700">
          Edit
        </button>
      </div>
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
  );
}
