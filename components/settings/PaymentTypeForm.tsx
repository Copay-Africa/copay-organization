/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { X } from "lucide-react";
import { PaymentType, CreatePaymentTypeBody } from "@/types/paymentTypes";
import { useCreatePaymentType, useUpdatePaymentType } from "../../hooks/usePaymentTypes";

interface PaymentTypeFormProps {
    organizationId: string;
    paymentType?: PaymentType | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function PaymentTypeForm({ organizationId, paymentType, isOpen, onClose, onSuccess }: PaymentTypeFormProps) {
    const [formData, setFormData] = React.useState({
        name: paymentType?.name || "",
        description: paymentType?.description || "",
        amount: paymentType?.amount || 0,
        amountType: paymentType?.amountType || "FIXED" as "FIXED" | "PARTIAL_ALLOWED" | "FLEXIBLE",
    });

    const createMutation = useCreatePaymentType();
    const updateMutation = useUpdatePaymentType();

    const isEditing = !!paymentType;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalData: CreatePaymentTypeBody = {
            name: formData.name,
            description: formData.description,
            amount: formData.amount,
            amountType: formData.amountType,
            // Set sensible defaults for other required fields
            allowPartialPayment: false,
            dueDay: 1,
            isRecurring: false,
            settings: {},
        };

        try {
            if (isEditing) {
                await updateMutation.mutateAsync({
                    id: paymentType.id,
                    body: finalData,
                });
            } else {
                await createMutation.mutateAsync(finalData);
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Failed to save payment type:", error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        {isEditing ? "Edit Payment Type" : "Add New Payment Type"}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Payment Type Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Monthly Rent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Amount (RWF) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="100"
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    placeholder="50000"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.amount > 0 && formatCurrency(formData.amount)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description of this payment type"
                            />
                        </div>

                        {/* Payment Configuration */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Payment Type
                                </label>
                                <Select
                                    value={formData.amountType}
                                    onValueChange={(value: "FIXED" | "PARTIAL_ALLOWED" | "FLEXIBLE") =>
                                        setFormData({ ...formData, amountType: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                        <SelectItem value="PARTIAL_ALLOWED">Partial Payments Allowed</SelectItem>
                                        <SelectItem value="FLEXIBLE">Flexible Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.amountType === "FIXED" && "Exact amount must be paid"}
                                    {formData.amountType === "PARTIAL_ALLOWED" && "Partial payments accepted"}
                                    {formData.amountType === "FLEXIBLE" && "Any amount can be paid"}
                                </p>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-2 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="flex-1">
                                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"} Payment Type
                            </Button>
                        </div>

                        {(createMutation.error || updateMutation.error) && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                <p className="text-sm text-destructive">
                                    {(createMutation.error || updateMutation.error)?.message}
                                </p>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}