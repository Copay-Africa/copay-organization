"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  ["/dashboard", "Dashboard"],
  ["/dashboard/tenants", "Tenants"],
  ["/dashboard/payments", "Payments"],
  ["/dashboard/rooms", "Rooms"],
  ["/dashboard/announcements", "Announcements"],
  ["/dashboard/complaints", "Complaints"],
  ["/dashboard/settings", "Settings"],
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-border bg-background/50 backdrop-blur-sm">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h2 className="text-lg font-semibold tracking-tight">Organization</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map(([href, label]) => {
          const isActive = pathname === href;
          return (
            <Link 
              key={String(href)} 
              href={String(href)} 
              className={clsx(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
