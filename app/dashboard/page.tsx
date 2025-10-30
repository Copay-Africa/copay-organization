import React from "react";
import { Card } from "../../components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>Summary card 1</Card>
        <Card>Summary card 2</Card>
        <Card>Summary card 3</Card>
      </div>
    </div>
  );
}
