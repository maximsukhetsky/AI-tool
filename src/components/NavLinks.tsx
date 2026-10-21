import Link from "next/link";

import { NavLinkPendingIndicator } from "@/components/NavLinkPendingIndicator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Editor" },
  { href: "/history", label: "History" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

// `pathname` is unknown while prerendering; links then render without an active state.
export function NavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = pathname !== undefined && isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
              active && "bg-muted font-medium text-foreground",
            )}
          >
            {label}
            <NavLinkPendingIndicator />
          </Link>
        );
      })}
    </nav>
  );
}
