"use client";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "../lib/authClient";

export type ComplaintStats = {
  summary: {
    totalComplaints: number;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  priorityBreakdown: Array<{
    priority: string;
    count: number;
  }>;
  recentComplaints: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    user: string;
    userPhone: string;
    createdAt: string;
  }>;
};

export type ComplaintStatsFilters = {
  fromDate?: string;
  toDate?: string;
};

async function fetchComplaintStats(filters: ComplaintStatsFilters = {}) {
  const token = getToken();
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/complaints/organization/stats?${params.toString()}` 
    : `/complaints/organization/stats?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch complaint stats: ${res.status}`);
  }

  const data = (await res.json()) as ComplaintStats;
  return data;
}

export function useComplaintStats(filters: ComplaintStatsFilters = {}) {
  return useQuery<ComplaintStats, Error>({
    queryKey: ["complaintStats", filters],
    queryFn: () => fetchComplaintStats(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}