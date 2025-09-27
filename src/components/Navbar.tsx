"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const links: { href: Route; label: string }[] = [
  { href: "/", label: "Inicio" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full">
      <ul className="flex items-center gap-4 text-sm">
        {links.map(({ href, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  "px-3 py-1.5 rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                ].join(" ")}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
