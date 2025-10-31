"use client";
import React, { useState } from "react";
import ComplaintsList from "../../../components/dashboard/ComplaintsList";
import ComplaintStats from "../../../components/dashboard/ComplaintStats";
import ComplaintDetailsModal from "../../../components/dashboard/ComplaintDetailsModal";
import { Button } from "../../../components/ui/Button";

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleComplaintClick = (id: string) => {
    setSelectedComplaintId(id);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedComplaintId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'list' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('list')}
        >
          Complaints List
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
        <ComplaintsList onComplaintClick={handleComplaintClick} />
      ) : (
        <ComplaintStats />
      )}

      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        complaintId={selectedComplaintId}
        open={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
