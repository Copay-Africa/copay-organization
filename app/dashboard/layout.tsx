import React from "react";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";

export const metadata = {
  title: "Dashboard - Copay Organization",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="container max-w-screen-2xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
