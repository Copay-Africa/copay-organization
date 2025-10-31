"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../lib/authClient";

export type Complaint = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  resolution?: string;
  resolvedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  cooperative: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ComplaintsResponse = {
  data: Complaint[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type ComplaintFilters = {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type UpdateComplaintStatusBody = {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
};

async function fetchComplaints(filters: ComplaintFilters = {}) {
  const token = getToken();
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/complaints/organization?${params.toString()}` 
    : `/complaints/organization?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";
    if (
      contentType.includes("text/html") ||
      text.trim().startsWith("<!DOCTYPE html>")
    ) {
      throw new Error(
        `Backend returned HTML (likely a 404). Requested URL: ${url}. Check NEXT_PUBLIC_API_BASE and ensure the API is reachable. Response snippet: ${text.slice(
          0,
          300
        )}`
      );
    }
    throw new Error(text || `Failed to fetch complaints: ${res.status}`);
  }

  const data = (await res.json()) as ComplaintsResponse;
  return data;
}

async function fetchComplaintById(id: string) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/complaints/${id}` 
    : `/complaints/${id}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch complaint: ${res.status}`);
  }

  const data = (await res.json()) as Complaint;
  return data;
}

async function updateComplaintStatus(id: string, body: UpdateComplaintStatusBody) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/complaints/${id}/status` 
    : `/complaints/${id}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to update complaint: ${res.status}`);
  }

  const data = (await res.json()) as Complaint;
  return data;
}

export function useComplaints(filters: ComplaintFilters = {}) {
  return useQuery<ComplaintsResponse, Error>({
    queryKey: ["complaints", filters],
    queryFn: () => fetchComplaints(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useComplaint(id: string) {
  return useQuery<Complaint, Error>({
    queryKey: ["complaint", id],
    queryFn: () => fetchComplaintById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  
  return useMutation<Complaint, Error, { id: string; body: UpdateComplaintStatusBody }>({
    mutationFn: ({ id, body }) => updateComplaintStatus(id, body),
    onSuccess: (updatedComplaint) => {
      // Invalidate and refetch complaints list
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      // Update the specific complaint in cache
      queryClient.setQueryData(["complaint", updatedComplaint.id], updatedComplaint);
      // Invalidate stats to refresh them
      queryClient.invalidateQueries({ queryKey: ["complaintStats"] });
    },
  });
}