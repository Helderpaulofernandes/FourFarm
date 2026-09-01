"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartHeaderLink() {
  const { itemCount } = useCart();

  return (
    <Link href="/store/cart" className="relative rounded-full px-4 py-2 text-sm font-medium text-stone-700 active:bg-stone-100">
      Cart
      {itemCount > 0 && (
        <span className="ml-1 rounded-full bg-green-700 px-2 py-0.5 text-xs font-medium text-white">{itemCount}</span>
      )}
    </Link>
  );
}
