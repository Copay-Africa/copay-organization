import React from "react";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";

export const metadata = {
  title: "Dashboard - Co-Pay Organization",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
