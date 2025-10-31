"use client";
import React, { useState } from "react";
import PaymentsList from "../../../components/dashboard/PaymentsList";
import PaymentStats from "../../../components/dashboard/PaymentStats";
import PaymentDetailsModal from "../../../components/dashboard/PaymentDetailsModal";
import { Button } from "../../../components/ui/Button";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handlePaymentClick = (id: string) => {
    setSelectedPaymentId(id);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedPaymentId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'list' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('list')}
        >
          Payments List
        </Button>
        <Button
          variant={activeTab === 'stats' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <PaymentsList onPaymentClick={handlePaymentClick} />
      ) : (
        <PaymentStats />
      )}

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        open={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
