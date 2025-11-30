'use client';

import { OrganizationSettings } from '@/components/settings/OrganizationSettings';
import { getCooperativeId } from '@/lib/authClient';

export default function SettingsPage() {
  const organizationId = getCooperativeId();

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access settings</p>
      </div>
    );
  }

  return <OrganizationSettings organizationId={organizationId} />;
}
