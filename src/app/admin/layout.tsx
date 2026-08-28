import Link from "next/link";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/Providers";
import { SignOutButton } from "@/components/SignOutButton";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/growing-units", label: "Beds & Tractors" },
  { href: "/admin/crops", label: "Crops" },
  { href: "/admin/inputs", label: "Inputs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <Providers>
      <div className="min-h-screen bg-stone-50">
        {session && (
          <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <span className="font-semibold text-stone-900">Four Farm</span>
              <SignOutButton />
            </div>
            <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-stone-700 active:bg-stone-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
        )}
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </div>
    </Providers>
  );
}
