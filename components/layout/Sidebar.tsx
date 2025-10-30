"use client";
import React from "react";
import Link from "next/link";

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
  return (
    <aside className="w-64 hidden md:block border-r border-muted bg-background">
      <nav className="p-4 space-y-2">
        {items.map(([href, label]) => (
          <Link key={String(href)} href={String(href)} className="block rounded px-3 py-2 hover:bg-foreground/5">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
