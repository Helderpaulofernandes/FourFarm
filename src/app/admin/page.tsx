import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";

export default async function DashboardPage() {
  const farmId = await getCurrentFarmId();

  const [varietyCount, areaCount, activeBatchCount, itemCount] = await Promise.all([
    db.varietyBreed.count({ where: { species: { farmId } } }),
    db.productionArea.count({ where: { farmId } }),
    db.productionBatch.count({ where: { farmId, status: { notIn: ["COMPLETED", "ABANDONED"] } } }),
    db.item.count({ where: { farmId } }),
  ]);

  const cards = [
    { label: "Varieties", value: varietyCount, href: "/admin/species" },
    { label: "Production areas", value: areaCount, href: "/admin/areas" },
    { label: "Active batches", value: activeBatchCount, href: "/admin/batches" },
    { label: "Inventory items", value: itemCount, href: "/admin/inventory" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-stone-200 bg-white p-4 active:bg-stone-100"
          >
            <div className="text-2xl font-semibold text-stone-900">{card.value}</div>
            <div className="text-sm text-stone-500">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
