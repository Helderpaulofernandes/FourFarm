"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm font-medium text-stone-500 active:text-stone-700"
    >
      Sign out
    </button>
  );
}
