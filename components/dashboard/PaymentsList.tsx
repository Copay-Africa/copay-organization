"use client";
import React, { useState } from "react";
import { usePayments, type PaymentFilters, type Payment } from "../../hooks/usePayments";
import Table from "../ui/Table";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import Select from "../ui/Select";
import { Badge } from "../ui/Badge";

export default function PaymentsList({ onPaymentClick }: { onPaymentClick?: (id: string) => void }) {
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 20,
    search: "",
    status: "",
    paymentMethod: "",
    fromDate: "",
    toDate: "",
  });

  const { data, isLoading, isError, error } = usePayments(filters);

  const updateFilter = (key: keyof PaymentFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when filtering
      ...(key !== 'page' ? { page: 1 } : {})
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status: string): "success" | "warning" | "destructive" | "secondary" => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const columns = [
    {
      key: "paymentReference",
      label: "Reference",
      render: (payment: Payment) => (
        <button
          className="text-primary hover:underline font-medium transition-colors"
          onClick={() => onPaymentClick?.(payment.id)}
        >
          {payment.paymentReference}
        </button>
      )
    },
    {
      key: "amount",
      label: "Amount",
      render: (payment: Payment) => (
        <span className="font-medium">
          {formatCurrency(payment.amount)}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (payment: Payment) => (
        <Badge variant={getStatusVariant(payment.status)}>
          {payment.status}
        </Badge>
      )
    },
    {
      key: "paymentType",
      label: "Type",
      render: (payment: Payment) => payment.paymentType?.name || '-'
    },
    {
      key: "sender",
      label: "Sender",
      render: (payment: Payment) => (
        <div>
          <div className="font-medium">{payment.sender.firstName} {payment.sender.lastName}</div>
          <div className="text-sm text-muted-foreground">{payment.sender.phone}</div>
        </div>
      )
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (payment: Payment) => (
        <span className="text-sm">
          {payment.paymentMethod?.replace(/_/g, ' ') || '-'}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "Date",
      render: (payment: Payment) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(payment.createdAt)}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Payments</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search payments..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
            />

            <Select
              value={filters.status || ""}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </Select>

            <Select
              value={filters.paymentMethod || ""}
              onChange={(e) => updateFilter("paymentMethod", e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="MOBILE_MONEY_MTN">MTN Mobile Money</option>
              <option value="MOBILE_MONEY_AIRTEL">Airtel Money</option>
              <option value="BANK_BK">Bank of Kigali</option>
            </Select>

            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.fromDate || ""}
                onChange={(e) => updateFilter("fromDate", e.target.value)}
              />
              <Input
                type="date"
                value={filters.toDate || ""}
                onChange={(e) => updateFilter("toDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading payments...</div>
        ) : isError ? (
          <div className="text-red-600 text-center py-8">
            {(error as Error).message}
          </div>
        ) : (
          <>
            <Table columns={columns} data={data?.data || []} />

            <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
              <div className="text-sm text-muted-foreground">
                {data?.meta ? `${data.meta.total} payments` : ""}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter("page", Math.max(1, (filters.page || 1) - 1))}
                  disabled={(filters.page || 1) === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 px-2 text-sm">
                  <span>Page</span>
                  <strong>{filters.page || 1}</strong>
                  <span>of</span>
                  <strong>{data?.meta.totalPages || 1}</strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter("page", (filters.page || 1) + 1)}
                  disabled={!data?.meta.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}