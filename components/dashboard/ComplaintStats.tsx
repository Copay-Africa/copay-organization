"use client";
import React, { useState } from "react";
import { useComplaintStats } from "../../hooks/useComplaintStats";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

export default function ComplaintStats() {
  const [dateFilters, setDateFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const { data: stats, isLoading, isError, error } = useComplaintStats(dateFilters);

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
      case 'OPEN':
        return 'bg-blue-500';
      case 'IN_PROGRESS':
        return 'bg-yellow-500';
      case 'RESOLVED':
        return 'bg-green-500';
      case 'CLOSED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-600';
      case 'MEDIUM':
        return 'bg-yellow-600';
      case 'LOW':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
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

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Complaint Statistics</h2>
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
          {/* Summary Card */}
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold">{stats.summary.totalComplaints.toLocaleString()}</div>
            <div className="text-muted">Total Complaints</div>
          </Card>

          {/* Status Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Complaint Status Breakdown</h3>
            <div className="space-y-3">
              {stats.statusBreakdown.map((status) => {
                const percentage = stats.summary.totalComplaints > 0 
                  ? (status.count / stats.summary.totalComplaints) * 100 
                  : 0;
                
                return (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${getStatusColor(status.status)}`}></div>
                      <span className="font-medium">{status.status.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{status.count.toLocaleString()} complaints</div>
                      <div className="text-sm text-muted">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Priority Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Priority Breakdown</h3>
            <div className="space-y-3">
              {stats.priorityBreakdown.map((priority) => {
                const percentage = stats.summary.totalComplaints > 0 
                  ? (priority.count / stats.summary.totalComplaints) * 100 
                  : 0;
                
                return (
                  <div key={priority.priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${getPriorityColor(priority.priority)}`}></div>
                      <span className="font-medium">{priority.priority}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{priority.count.toLocaleString()} complaints</div>
                      <div className="text-sm text-muted">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Complaints */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
            <div className="space-y-3">
              {stats.recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between p-3 border border-muted rounded">
                  <div className="flex-1">
                    <div className="font-medium">{complaint.title}</div>
                    <div className="text-sm text-muted">
                      {complaint.user} • {complaint.userPhone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={getStatusBadge(complaint.status)}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={getPriorityBadge(complaint.priority)}>
                      {complaint.priority}
                    </span>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-muted">{formatDate(complaint.createdAt)}</div>
                  </div>
                </div>
              ))}
              {stats.recentComplaints.length === 0 && (
                <div className="text-center py-4 text-muted">No recent complaints</div>
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