"use client";

import { LayoutDashboard, CalendarCheck, Car, Star, Ticket } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/promos", label: "Promo codes", icon: Ticket },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 md:flex-col">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
