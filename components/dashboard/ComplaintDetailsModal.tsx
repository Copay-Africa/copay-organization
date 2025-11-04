"use client";
import React, { useState } from "react";
import { useComplaint, useUpdateComplaintStatus, type UpdateComplaintStatusBody } from "../../hooks/useComplaints";
import Modal from "../ui/Modal";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export default function ComplaintDetailsModal({ 
  complaintId, 
  open, 
  onClose 
}: { 
  complaintId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: complaint, isLoading, isError, error } = useComplaint(complaintId || "");
  const updateMutation = useUpdateComplaintStatus();
  
  const [statusForm, setStatusForm] = useState({
    status: "" as UpdateComplaintStatusBody['status'] | "",
    resolution: "",
  });

  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  // Reset form when complaint changes
  React.useEffect(() => {
    if (complaint) {
      setStatusForm({
        status: complaint.status,
        resolution: complaint.resolution || "",
      });
    }
  }, [complaint]);

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
      case 'OPEN':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'RESOLVED':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'CLOSED':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (priority) {
      case 'HIGH':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'MEDIUM':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'LOW':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !statusForm.status) return;

    const body: UpdateComplaintStatusBody = {
      status: statusForm.status,
    };

    // Include resolution if provided
    if (statusForm.resolution.trim()) {
      body.resolution = statusForm.resolution.trim();
    }

    updateMutation.mutate(
      { id: complaint.id, body },
      {
        onSuccess: () => {
          setShowStatusUpdate(false);
        },
      }
    );
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Complaint Details">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">Loading complaint details...</div>
        ) : isError ? (
          <div className="text-red-600 text-center py-8">
            {(error as Error).message}
          </div>
        ) : complaint ? (
          <>
            {/* Complaint Header */}
            <Card className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{complaint.title}</h3>
                <div className="flex gap-2">
                  <span className={getStatusBadge(complaint.status)}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                  <span className={getPriorityBadge(complaint.priority)}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-muted">Description</label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {complaint.description}
                  </div>
                </div>
              </div>
            </Card>

            {/* Complainant Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Complainant</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted">Name</label>
                  <div>{complaint.user.firstName} {complaint.user.lastName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Phone</label>
                  <div>{complaint.user.phone}</div>
                </div>
                {complaint.user.email && (
                  <div>
                    <label className="block text-sm font-medium text-muted">Email</label>
                    <div>{complaint.user.email}</div>
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
                  <div>{complaint.cooperative.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Code</label>
                  <div>{complaint.cooperative.code}</div>
                </div>
              </div>
            </Card>

            {/* Resolution */}
            {complaint.resolution && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Resolution</h3>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  {complaint.resolution}
                </div>
              </Card>
            )}

            {/* Status Update Section */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Update Status</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                >
                  {showStatusUpdate ? "Cancel" : "Update Status"}
                </Button>
              </div>

              {showStatusUpdate && (
                <form onSubmit={handleStatusUpdate} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-muted rounded-md bg-card-bg"
                      value={statusForm.status}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value as UpdateComplaintStatusBody['status'] }))}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                      Resolution Message (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-muted rounded-md bg-card-bg"
                      rows={3}
                      value={statusForm.resolution}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, resolution: e.target.value }))}
                      placeholder="Enter resolution details or update message..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={updateMutation.status === "pending" || !statusForm.status}
                    >
                      {updateMutation.status === "pending" ? "Updating..." : "Update Status"}
                    </Button>
                  </div>

                  {updateMutation.status === "error" && (
                    <div className="text-sm text-red-600">
                      {(updateMutation.error as Error).message}
                    </div>
                  )}
                </form>
              )}
            </Card>

            {/* Timestamps */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted">Created</label>
                  <div>{formatDate(complaint.createdAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Last Updated</label>
                  <div>{formatDate(complaint.updatedAt)}</div>
                </div>
                {complaint.resolvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-muted">Resolved</label>
                    <div>{formatDate(complaint.resolvedAt)}</div>
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : (
          <div className="text-center py-8">No complaint found</div>
        )}
      </div>
    </Modal>
  );
}