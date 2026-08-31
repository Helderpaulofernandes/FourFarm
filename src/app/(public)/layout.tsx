import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-stone-900">
            Four Farm
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 active:bg-stone-100"
          >
            Farm Admin
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
