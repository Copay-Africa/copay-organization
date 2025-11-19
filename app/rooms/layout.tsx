import React from "react";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";

export const metadata = {
  title: "Rooms - CoPay Organization",
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="container max-w-screen-2xl mx-auto p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}