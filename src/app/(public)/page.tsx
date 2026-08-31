import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">Four Farm</h1>
      <p className="mt-2 max-w-md text-stone-500">
        A no-till market garden and pastured poultry operation. Browse what we&apos;re growing right now, and
        see exactly how it&apos;s raised.
      </p>
      <Link
        href="/store"
        className="mt-6 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white active:bg-green-800"
      >
        Browse the store
      </Link>
      <p className="mt-4 max-w-md text-sm text-stone-400">
        CSA boxes and pick-your-own visits are coming soon.
      </p>
    </div>
  );
}
