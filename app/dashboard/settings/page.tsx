import React from "react";
import { Card } from "../../../components/ui/Card";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <Card>
        <p>Organization settings, billing details, integrations.</p>
      </Card>
    </div>
  );
}
