"use client";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "../lib/authClient";

export type PaymentStats = {
  summary: {
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  methodBreakdown: Array<{
    method: string;
    count: number;
    totalAmount: number;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentType: string;
    sender: string;
    senderPhone: string;
    createdAt: string;
  }>;
};

export type StatsFilters = {
  fromDate?: string;
  toDate?: string;
};

async function fetchPaymentStats(filters: StatsFilters = {}) {
  const token = getToken();
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payments/organization/stats?${params.toString()}` 
    : `/payments/organization/stats?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch payment stats: ${res.status}`);
  }

  const data = (await res.json()) as PaymentStats;
  return data;
}

export function usePaymentStats(filters: StatsFilters = {}) {
  return useQuery<PaymentStats, Error>({
    queryKey: ["paymentStats", filters],
    queryFn: () => fetchPaymentStats(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}