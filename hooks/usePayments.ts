"use client";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "../lib/authClient";

export type Payment = {
  id: string;
  amount: number;
  status: string;
  description: string;
  paymentMethod: string;
  paymentReference: string;
  paymentType: {
    id: string;
    name: string;
    description: string;
    amount?: number;
    amountType?: string;
  };
  sender: {
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
  latestTransaction?: {
    id: string;
    status: string;
    gatewayTransactionId: string;
    createdAt: string;
  };
  transactions?: Array<{
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    gatewayTransactionId: string;
    gatewayReference: string;
    gatewayResponse?: Record<string, unknown>;
    processingStartedAt?: string;
    processingCompletedAt?: string;
    failureReason?: string;
    webhookReceived?: boolean;
    webhookReceivedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentsResponse = {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type PaymentFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  senderId?: string;
  paymentTypeId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

async function fetchPayments(filters: PaymentFilters = {}) {
  const token = getToken();
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payments/organization?${params.toString()}` 
    : `/payments/organization?${params.toString()}`;

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
    throw new Error(text || `Failed to fetch payments: ${res.status}`);
  }

  const data = (await res.json()) as PaymentsResponse;
  return data;
}

async function fetchPaymentById(id: string) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payments/organization/${id}` 
    : `/payments/organization/${id}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch payment: ${res.status}`);
  }

  const data = (await res.json()) as Payment;
  return data;
}

export function usePayments(filters: PaymentFilters = {}) {
  return useQuery<PaymentsResponse, Error>({
    queryKey: ["payments", filters],
    queryFn: () => fetchPayments(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function usePayment(id: string) {
  return useQuery<Payment, Error>({
    queryKey: ["payment", id],
    queryFn: () => fetchPaymentById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}