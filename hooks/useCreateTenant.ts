"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../lib/authClient";

export type CreateTenantBody = {
  phone: string;
  pin: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string; // e.g. TENANT
  cooperativeId: string;
};

export type Tenant = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  status?: string;
  cooperativeId?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

async function postTenant(body: CreateTenantBody) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base ? `${base.replace(/\/$/, "")}/users` : `/users`;

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
    throw new Error(text || `Failed to create tenant: ${res.status}`);
  }

  const data = (await res.json()) as Tenant;
  return data;
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation<Tenant, Error, CreateTenantBody>({
    mutationFn: postTenant,
    onSuccess: () => {
      // Invalidate tenants list so it refetches
      qc.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}
