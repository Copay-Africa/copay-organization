/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { PaymentTypeForm } from './PaymentTypeForm';
import { usePaymentTypes, useUpdatePaymentTypeStatus, useDeletePaymentType } from '@/hooks/usePaymentTypes';
import type { PaymentType } from '@/types/paymentTypes';

interface PaymentTypeListProps {
  organizationId: string;
}

export function PaymentTypeList({ organizationId }: PaymentTypeListProps) {
  const paymentTypesQuery = usePaymentTypes(organizationId, { includeInactive: true });
  const { data: paymentTypes, isLoading, error } = paymentTypesQuery;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (paymentType: PaymentType) => {
    setEditingPaymentType(paymentType);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPaymentType(null);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAmountTypeLabel = (type: PaymentType['amountType']) => {
    switch (type) {
      case 'FIXED':
        return 'Fixed Amount';
      case 'PARTIAL_ALLOWED':
        return 'Partial Payment Allowed';
      case 'FLEXIBLE':
        return 'Flexible Amount';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Payment Types</CardTitle>
          <p className="text-muted-foreground text-sm">
            Loading payment types...
          </p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Payment Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
            <p className="text-destructive font-medium">Error loading payment types</p>
            <p className="text-muted-foreground text-sm mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Payment Types</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Manage organization payment types
              </p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>

          {!paymentTypes || paymentTypes.data.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No payment types</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first payment type
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                variant="outline"
              >
                Create Payment Type
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentTypes.data.map((paymentType) => (
                <PaymentTypeCard
                  key={paymentType.id}
                  paymentType={paymentType}
                  organizationId={organizationId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === paymentType.id}
                  formatCurrency={formatCurrency}
                  getAmountTypeLabel={getAmountTypeLabel}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <PaymentTypeForm
          organizationId={organizationId}
          paymentType={editingPaymentType}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}

      {deletingId && (
        <DeleteConfirmDialog
          paymentTypeId={deletingId}
          organizationId={organizationId}
          onClose={() => setDeletingId(null)}
        />
      )}
    </>
  );
}

interface PaymentTypeCardProps {
  paymentType: PaymentType;
  organizationId: string;
  onEdit: (paymentType: PaymentType) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  formatCurrency: (amount: number) => string;
  getAmountTypeLabel: (type: PaymentType['amountType']) => string;
}

function PaymentTypeCard({
  paymentType,
  organizationId,
  onEdit,
  onDelete,
  isDeleting,
  formatCurrency,
  getAmountTypeLabel,
}: PaymentTypeCardProps) {
  const updatePaymentTypeStatus = useUpdatePaymentTypeStatus();

  const handleStatusToggle = async (checked: boolean) => {
    try {
      await updatePaymentTypeStatus.mutateAsync({
        id: paymentType.id,
        isActive: checked,
      });
    } catch (error) {
      console.error('Error updating payment type status:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-foreground truncate">{paymentType.name}</h4>
              {paymentType.description && (
                <p className="text-sm text-muted-foreground mt-1">{paymentType.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Type:</span>
                  {getAmountTypeLabel(paymentType.amountType)}
                </span>

                {paymentType.amountType !== 'FLEXIBLE' && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Amount:</span>
                    {formatCurrency(paymentType.amount)}
                  </span>
                )}

                {paymentType.dueDay && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Due Day:</span>
                    {paymentType.dueDay}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Badge 
                variant={paymentType.isActive ? "default" : "secondary"}
                className={`text-xs font-medium ${
                  paymentType.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {paymentType.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <div className="flex items-center gap-2">
                <Switch
                  checked={paymentType.isActive}
                  onCheckedChange={handleStatusToggle}
                  disabled={updatePaymentTypeStatus.isPending}
                />
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  Toggle status
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(paymentType)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(paymentType.id)}
            disabled={isDeleting}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmDialogProps {
  paymentTypeId: string;
  organizationId: string;
  onClose: () => void;
}

function DeleteConfirmDialog({ paymentTypeId, organizationId, onClose }: DeleteConfirmDialogProps) {
  const deletePaymentType = useDeletePaymentType();

  const handleDelete = async () => {
    try {
      await deletePaymentType.mutateAsync(paymentTypeId);
      onClose();
    } catch (error) {
      console.error('Error deleting payment type:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>Delete Payment Type</CardTitle>
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-6">
            Are you sure you want to delete this payment type? All associated data will be permanently lost.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={deletePaymentType.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePaymentType.isPending}
            >
              {deletePaymentType.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}