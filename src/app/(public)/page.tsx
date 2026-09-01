import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">Four Farm</h1>
      <p className="mt-2 max-w-md text-stone-500">
        A no-till market garden and pastured poultry operation. Browse what we&apos;re growing right now, and
        see exactly how it&apos;s raised.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/store"
          className="rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white active:bg-green-800"
        >
          Browse the store
        </Link>
        <Link
          href="/transparency"
          className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 active:bg-stone-100"
        >
          How we grow
        </Link>
      </div>
      <p className="mt-4 max-w-md text-sm text-stone-400">
        CSA subscriptions are available in the store (look for the CSA badge) — already subscribed?{" "}
        <Link href="/store/csa/manage" className="text-green-700 underline">
          Manage it here
        </Link>
        . Or{" "}
        <Link href="/pick-your-own" className="text-green-700 underline">
          book a pick-your-own visit
        </Link>
        .
      </p>
    </div>
  );
}
