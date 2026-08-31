import Link from "next/link";
import { getAreaOccupancyForYear } from "@/server/actions/planner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function spanForMonth(spans: { batchId: string; batchCode: string; varietyName: string; start: Date; end: Date | null }[], year: number, month: number) {
  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 1));
  return spans.find((s) => s.start < monthEnd && (s.end === null || s.end >= monthStart));
}

export default async function PlannerPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  const areas = await getAreaOccupancyForYear(year);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">Yearly planner</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/admin/planner?year=${year - 1}`} className="text-green-700 underline">
            {year - 1}
          </Link>
          <span className="font-medium text-stone-900">{year}</span>
          <Link href={`/admin/planner?year=${year + 1}`} className="text-green-700 underline">
            {year + 1}
          </Link>
        </div>
      </div>
      <p className="text-sm text-stone-500">Ground occupation per area — blank cells are gaps available for the next planting.</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="w-32 text-left text-xs font-medium text-stone-500">Area</th>
              {MONTHS.map((m) => (
                <th key={m} className="text-xs font-medium text-stone-500">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area.id}>
                <td className="whitespace-nowrap pr-2 text-sm font-medium text-stone-800">{area.name}</td>
                {MONTHS.map((_, monthIdx) => {
                  const span = spanForMonth(area.spans, year, monthIdx);
                  return (
                    <td key={monthIdx} className="p-0">
                      {span ? (
                        <Link
                          href={`/admin/batches/${span.batchId}`}
                          className="block rounded-md bg-green-100 px-1 py-2 text-center text-xs font-medium text-green-800 hover:bg-green-200"
                          title={`${span.varietyName} (${span.batchCode})`}
                        >
                          {span.varietyName}
                        </Link>
                      ) : (
                        <div className="rounded-md border border-dashed border-stone-200 px-1 py-2 text-center text-xs text-stone-300">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {areas.length === 0 && (
              <tr>
                <td colSpan={13} className="py-4 text-center text-stone-500">
                  No production areas yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
