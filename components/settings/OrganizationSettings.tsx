'use client';

import { useState } from 'react';
import { CreditCard, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PaymentTypeList } from '@/components/settings/PaymentTypeList';

interface OrganizationSettingsProps {
    organizationId: string;
}

type SettingTab = 'general' | 'payment-types';

interface SettingTabConfig {
    id: SettingTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const settingTabs: SettingTabConfig[] = [
    {
        id: 'general',
        label: 'General',
        icon: Building,
        description: 'Basic organization information',
    },
    {
        id: 'payment-types',
        label: 'Payment Types',
        icon: CreditCard,
        description: 'Manage cooperative payment types',
    },
];

export function OrganizationSettings({ organizationId }: OrganizationSettingsProps) {
    const [activeTab, setActiveTab] = useState<SettingTab>('payment-types');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings organizationId={organizationId} />;
            case 'payment-types':
                return <PaymentTypeList organizationId={organizationId} />;
            default:
                return <PaymentTypeList organizationId={organizationId} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Organization Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your organization configuration and preferences
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Settings Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-wrap gap-2 p-4">
                        {settingTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <Button
                                    key={tab.id}
                                    variant={activeTab === tab.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex-shrink-0"
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    );
}

function GeneralSettings({ organizationId }: { organizationId: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Organization Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. Green Valley Cooperative"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Organization Type
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. Housing Cooperative"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Describe your organization..."
                        />
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <Button>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
}