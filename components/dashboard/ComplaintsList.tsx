"use client";
import React, { useState } from "react";
import { useComplaints, type ComplaintFilters, type Complaint } from "../../hooks/useComplaints";
import Table from "../ui/Table";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import Select from "../ui/Select";
import { Badge } from "../ui/Badge";

export default function ComplaintsList({ onComplaintClick }: { onComplaintClick?: (id: string) => void }) {
  const [filters, setFilters] = useState<ComplaintFilters>({
    page: 1,
    limit: 20,
    search: "",
    status: "",
    priority: "",
    fromDate: "",
    toDate: "",
  });

  const { data, isLoading, isError, error } = useComplaints(filters);

  const updateFilter = (key: keyof ComplaintFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when filtering
      ...(key !== 'page' ? { page: 1 } : {})
    }));
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

  const getStatusVariant = (status: string): "default" | "secondary" | "success" | "warning" | "destructive" => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'IN_PROGRESS':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string): "destructive" | "warning" | "secondary" => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const columns = [
    { 
      key: "title", 
      label: "Title",
      render: (complaint: Complaint) => (
        <button 
          className="text-primary hover:underline font-medium text-left transition-colors"
          onClick={() => onComplaintClick?.(complaint.id)}
        >
          {complaint.title}
        </button>
      )
    },
    { 
      key: "status", 
      label: "Status",
      render: (complaint: Complaint) => (
        <Badge variant={getStatusVariant(complaint.status)}>
          {complaint.status.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      key: "priority", 
      label: "Priority",
      render: (complaint: Complaint) => (
        <Badge variant={getPriorityVariant(complaint.priority)}>
          {complaint.priority}
        </Badge>
      )
    },
    { 
      key: "user", 
      label: "Complainant",
      render: (complaint: Complaint) => (
        <div>
          <div className="font-medium">{complaint.user.firstName} {complaint.user.lastName}</div>
          <div className="text-sm text-muted-foreground">{complaint.user.phone}</div>
        </div>
      )
    },
    { 
      key: "cooperative", 
      label: "Cooperative",
      render: (complaint: Complaint) => (
        <div>
          <div className="font-medium">{complaint.cooperative.name}</div>
          <div className="text-sm text-muted-foreground">{complaint.cooperative.code}</div>
        </div>
      )
    },
    { 
      key: "createdAt", 
      label: "Created",
      render: (complaint: Complaint) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(complaint.createdAt)}
        </span>
      )
    },
    { 
      key: "updatedAt", 
      label: "Updated",
      render: (complaint: Complaint) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(complaint.updatedAt)}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Complaints</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search complaints..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
            
            <Select
              value={filters.status || ""}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </Select>

            <Select
              value={filters.priority || ""}
              onChange={(e) => updateFilter("priority", e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
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
          <div className="text-center py-8">Loading complaints...</div>
        ) : isError ? (
          <div className="text-red-600 text-center py-8">
            {(error as Error).message}
          </div>
        ) : (
          <>
            <Table columns={columns} data={data?.data || []} />

            <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
              <div className="text-sm text-muted-foreground">
                {data?.meta ? `${data.meta.total} complaints` : ""}
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