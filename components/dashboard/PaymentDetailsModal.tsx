"use client";
import React from "react";
import { usePayment } from "../../hooks/usePayments";
import Modal from "../ui/Modal";
import { Card } from "../ui/Card";

export default function PaymentDetailsModal({ 
  paymentId, 
  open, 
  onClose 
}: { 
  paymentId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: payment, isLoading, isError, error } = usePayment(paymentId || "");

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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Payment Details">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">Loading payment details...</div>
        ) : isError ? (
          <div className="text-red-600 text-center py-8">
            {(error as Error).message}
          </div>
        ) : payment ? (
          <>
            {/* Payment Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted">Reference</label>
                  <div className="font-mono">{payment.paymentReference}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Amount</label>
                  <div className="text-lg font-semibold">{formatCurrency(payment.amount)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Status</label>
                  <span className={getStatusBadge(payment.status)}>
                    {payment.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Payment Method</label>
                  <div>{payment.paymentMethod?.replace(/_/g, ' ')}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-muted">Description</label>
                  <div>{payment.description}</div>
                </div>
              </div>
            </Card>

            {/* Payment Type */}
            {payment.paymentType && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Payment Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted">Name</label>
                    <div>{payment.paymentType.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted">Description</label>
                    <div>{payment.paymentType.description}</div>
                  </div>
                  {payment.paymentType.amount && (
                    <div>
                      <label className="block text-sm font-medium text-muted">Expected Amount</label>
                      <div>{formatCurrency(payment.paymentType.amount)} ({payment.paymentType.amountType})</div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Sender Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Sender</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted">Name</label>
                  <div>{payment.sender.firstName} {payment.sender.lastName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Phone</label>
                  <div>{payment.sender.phone}</div>
                </div>
                {payment.sender.email && (
                  <div>
                    <label className="block text-sm font-medium text-muted">Email</label>
                    <div>{payment.sender.email}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Cooperative Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Cooperative</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted">Name</label>
                  <div>{payment.cooperative.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Code</label>
                  <div>{payment.cooperative.code}</div>
                </div>
              </div>
            </Card>

            {/* Transaction History */}
            {payment.transactions && payment.transactions.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Transaction History</h3>
                <div className="space-y-3">
                  {payment.transactions.map((transaction) => (
                    <div key={transaction.id} className="border border-muted rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Transaction {transaction.id}</span>
                        <span className={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted">Amount:</span> {formatCurrency(transaction.amount)}
                        </div>
                        <div>
                          <span className="text-muted">Gateway ID:</span> {transaction.gatewayTransactionId}
                        </div>
                        <div>
                          <span className="text-muted">Created:</span> {formatDate(transaction.createdAt)}
                        </div>
                        {transaction.processingCompletedAt && (
                          <div>
                            <span className="text-muted">Completed:</span> {formatDate(transaction.processingCompletedAt)}
                          </div>
                        )}
                        {transaction.failureReason && (
                          <div className="col-span-2">
                            <span className="text-muted">Failure Reason:</span> 
                            <span className="text-red-600 ml-1">{transaction.failureReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Timestamps */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Timestamps</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted">Created At</label>
                  <div>{formatDate(payment.createdAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Updated At</label>
                  <div>{formatDate(payment.updatedAt)}</div>
                </div>
                {payment.paidAt && (
                  <div>
                    <label className="block text-sm font-medium text-muted">Paid At</label>
                    <div>{formatDate(payment.paidAt)}</div>
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : (
          <div className="text-center py-8">No payment found</div>
        )}
      </div>
    </Modal>
  );
}