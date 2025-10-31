"use client";
import React, { useState } from "react";
import { usePaymentStats } from "../../hooks/usePaymentStats";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

export default function PaymentStats() {
  const [dateFilters, setDateFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const { data: stats, isLoading, isError, error } = usePaymentStats(dateFilters);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY_MTN':
        return 'bg-yellow-600';
      case 'MOBILE_MONEY_AIRTEL':
        return 'bg-red-600';
      case 'BANK_BK':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Payment Statistics</h2>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">From Date</label>
            <Input
              type="date"
              value={dateFilters.fromDate}
              onChange={(e) => setDateFilters(prev => ({ ...prev, fromDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">To Date</label>
            <Input
              type="date"
              value={dateFilters.toDate}
              onChange={(e) => setDateFilters(prev => ({ ...prev, toDate: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <div className="text-center">Loading statistics...</div>
        </Card>
      ) : isError ? (
        <Card className="p-8">
          <div className="text-red-600 text-center">
            {(error as Error).message}
          </div>
        </Card>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold">{stats.summary.totalPayments.toLocaleString()}</div>
              <div className="text-muted">Total Payments</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold">{formatCurrency(stats.summary.totalAmount)}</div>
              <div className="text-muted">Total Amount</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold">{formatCurrency(stats.summary.averageAmount)}</div>
              <div className="text-muted">Average Payment</div>
            </Card>
          </div>

          {/* Status Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Status Breakdown</h3>
            <div className="space-y-3">
              {stats.statusBreakdown.map((status) => {
                const percentage = stats.summary.totalPayments > 0 
                  ? (status.count / stats.summary.totalPayments) * 100 
                  : 0;
                
                return (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${getStatusColor(status.status)}`}></div>
                      <span className="font-medium">{status.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{status.count.toLocaleString()} payments</div>
                      <div className="text-sm text-muted">
                        {formatCurrency(status.totalAmount)} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Payment Method Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method Breakdown</h3>
            <div className="space-y-3">
              {stats.methodBreakdown.map((method) => {
                const percentage = stats.summary.totalPayments > 0 
                  ? (method.count / stats.summary.totalPayments) * 100 
                  : 0;
                
                return (
                  <div key={method.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${getMethodColor(method.method)}`}></div>
                      <span className="font-medium">{method.method.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{method.count.toLocaleString()} payments</div>
                      <div className="text-sm text-muted">
                        {formatCurrency(method.totalAmount)} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Payments */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
            <div className="space-y-3">
              {stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border border-muted rounded">
                  <div>
                    <div className="font-medium">{payment.sender}</div>
                    <div className="text-sm text-muted">
                      {payment.paymentType} • {payment.senderPhone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                    <div className="text-sm text-muted">{formatDate(payment.createdAt)}</div>
                  </div>
                </div>
              ))}
              {stats.recentPayments.length === 0 && (
                <div className="text-center py-4 text-muted">No recent payments</div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8">
          <div className="text-center text-muted">No statistics available</div>
        </Card>
      )}
    </div>
  );
}