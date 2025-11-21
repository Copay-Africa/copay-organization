"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "../ui/Sheet";
import { Button } from "../ui/Button";
import { Menu, Home, Users, Building, CreditCard, AlertCircle, X } from "lucide-react";

const items = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home
  },
  {
    href: "/dashboard/tenants",
    label: "Tenants",
    icon: Users
  },
  {
    href: "/rooms",
    label: "Rooms",
    icon: Building
  },
  {
    href: "/dashboard/payments",
    label: "Payments",
    icon: CreditCard
  },
  {
    href: "/dashboard/complaints",
    label: "Complaints",
    icon: AlertCircle
  }
];

function NavigationItems({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onItemClick}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Mobile Navigation (Sheet/Drawer)
export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 hover:bg-accent"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="flex items-center gap-2 text-left">
            <Building className="h-6 w-6 text-primary" />
            Organization
          </SheetTitle>
        </SheetHeader>
        <div className="px-6 py-4 space-y-4">
          <NavigationItems onItemClick={() => setOpen(false)} />
        </div>
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background/50 backdrop-blur-sm">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Copay</h2>
        </div>
      </div>
      <div className="flex-1 p-4">
        <NavigationItems />
      </div>
    </aside>
  );
}
