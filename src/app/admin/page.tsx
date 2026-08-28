import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";

export default async function DashboardPage() {
  const farmId = await getCurrentFarmId();

  const [cropCount, unitCount, activeOccupancyCount, inputCount] = await Promise.all([
    db.crop.count({ where: { farmId } }),
    db.growingUnit.count({ where: { farmId } }),
    db.occupancy.count({ where: { growingUnit: { farmId }, status: "ACTIVE" } }),
    db.inputMaterial.count({ where: { farmId } }),
  ]);

  const cards = [
    { label: "Crops", value: cropCount, href: "/admin/crops" },
    { label: "Beds & tractors", value: unitCount, href: "/admin/growing-units" },
    { label: "Active plantings/batches", value: activeOccupancyCount, href: "/admin/growing-units" },
    { label: "Input materials", value: inputCount, href: "/admin/inputs" },
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
