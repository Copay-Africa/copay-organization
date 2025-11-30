"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../lib/authClient";
import type { 
  PaymentType, 
  PaymentTypesResponse, 
  PaymentTypeFilters, 
  CreatePaymentTypeBody 
} from "@/types/paymentTypes";

async function fetchPaymentTypes(cooperativeId: string, filters: PaymentTypeFilters = {}) {
  const token = getToken();
  const params = new URLSearchParams({
    cooperativeId,
  });
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = base 
    ? `${base.replace(/\/$/, "")}/payment-types${queryString}` 
    : `/payment-types${queryString}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Payment types endpoint is public according to API docs, but we include token if available
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
    throw new Error(text || `Failed to fetch payment types: ${res.status}`);
  }

  const data = (await res.json()) as PaymentTypesResponse;
  return data;
}

async function fetchActivePaymentTypes(cooperativeId: string) {
  const token = getToken();
  const params = new URLSearchParams({ cooperativeId });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payment-types/active?${params.toString()}` 
    : `/payment-types/active?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch active payment types: ${res.status}`);
  }

  const data = (await res.json()) as PaymentTypesResponse;
  return data;
}

async function fetchPaymentTypeById(id: string, cooperativeId: string) {
  const token = getToken();
  const params = new URLSearchParams({ cooperativeId });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payment-types/${id}?${params.toString()}` 
    : `/payment-types/${id}?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch payment type: ${res.status}`);
  }

  const data = (await res.json()) as PaymentType;
  return data;
}

async function createPaymentType(body: CreatePaymentTypeBody) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payment-types` 
    : `/payment-types`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to create payment type: ${res.status}`);
  }

  const data = (await res.json()) as PaymentType;
  return data;
}

async function updatePaymentTypeStatus(id: string, isActive: boolean) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payment-types/${id}/status` 
    : `/payment-types/${id}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to update payment type status: ${res.status}`);
  }

  const data = (await res.json()) as PaymentType;
  return data;
}

async function updatePaymentType(id: string, body: Partial<CreatePaymentTypeBody>) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payment-types/${id}` 
    : `/payment-types/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to update payment type: ${res.status}`);
  }

  const data = (await res.json()) as PaymentType;
  return data;
}

async function deletePaymentType(id: string) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/payment-types/${id}` 
    : `/payment-types/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to delete payment type: ${res.status}`);
  }

  return { success: true };
}

export function usePaymentTypes(cooperativeId: string, filters: PaymentTypeFilters = {}) {
  return useQuery<PaymentTypesResponse, Error>({
    queryKey: ["paymentTypes", cooperativeId, filters],
    queryFn: () => fetchPaymentTypes(cooperativeId, filters),
    enabled: !!cooperativeId, // Only run query if cooperativeId is provided
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useActivePaymentTypes(cooperativeId: string) {
  return useQuery<PaymentTypesResponse, Error>({
    queryKey: ["activePaymentTypes", cooperativeId],
    queryFn: () => fetchActivePaymentTypes(cooperativeId),
    enabled: !!cooperativeId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function usePaymentType(id: string, cooperativeId: string) {
  return useQuery<PaymentType, Error>({
    queryKey: ["paymentType", id, cooperativeId],
    queryFn: () => fetchPaymentTypeById(id, cooperativeId),
    enabled: !!id && !!cooperativeId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreatePaymentType() {
  const queryClient = useQueryClient();
  
  return useMutation<PaymentType, Error, CreatePaymentTypeBody>({
    mutationFn: (body) => createPaymentType(body),
    onSuccess: (newPaymentType) => {
      // Invalidate and refetch payment types list
      queryClient.invalidateQueries({ queryKey: ["paymentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["activePaymentTypes"] });
      // Set the new payment type in cache
      queryClient.setQueryData(
        ["paymentType", newPaymentType.id, newPaymentType.cooperativeId], 
        newPaymentType
      );
    },
  });
}

export function useUpdatePaymentTypeStatus() {
  const queryClient = useQueryClient();
  
  return useMutation<PaymentType, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => updatePaymentTypeStatus(id, isActive),
    onSuccess: (updatedPaymentType) => {
      // Invalidate and refetch payment types list
      queryClient.invalidateQueries({ queryKey: ["paymentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["activePaymentTypes"] });
      // Update the payment type in cache
      queryClient.setQueryData(
        ["paymentType", updatedPaymentType.id, updatedPaymentType.cooperativeId], 
        updatedPaymentType
      );
    },
  });
}

export function useUpdatePaymentType() {
  const queryClient = useQueryClient();
  
  return useMutation<PaymentType, Error, { id: string; body: Partial<CreatePaymentTypeBody> }>({
    mutationFn: ({ id, body }) => updatePaymentType(id, body),
    onSuccess: (updatedPaymentType) => {
      // Invalidate and refetch payment types list
      queryClient.invalidateQueries({ queryKey: ["paymentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["activePaymentTypes"] });
      // Update the payment type in cache
      queryClient.setQueryData(
        ["paymentType", updatedPaymentType.id, updatedPaymentType.cooperativeId], 
        updatedPaymentType
      );
    },
  });
}

export function useDeletePaymentType() {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => deletePaymentType(id),
    onSuccess: () => {
      // Invalidate and refetch payment types list
      queryClient.invalidateQueries({ queryKey: ["paymentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["activePaymentTypes"] });
    },
  });
}