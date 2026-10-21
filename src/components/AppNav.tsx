"use client";

import { usePathname } from "next/navigation";

import { NavLinks } from "@/components/NavLinks";

// Reads the pathname, so it must render inside a <Suspense> boundary (fallback: <NavLinks />).
export function AppNav() {
  return <NavLinks pathname={usePathname()} />;
}
