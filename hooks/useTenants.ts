"use client";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "../lib/authClient";

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

export type TenantsResponse = {
  data: Tenant[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

async function fetchTenants(page = 1, limit = 10) {
  const token = getToken();
  const qs = `?page=${page}&limit=${limit}`;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base ? `${base.replace(/\/$/, "")}/users${qs}` : `/users${qs}`;

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

    throw new Error(text || `Failed to fetch tenants: ${res.status}`);
  }

  const data = (await res.json()) as TenantsResponse;
  return data;
}

export function useTenants(page = 1, limit = 10) {
  return useQuery<TenantsResponse, Error>({
    queryKey: ["tenants", page, limit],
    queryFn: () => fetchTenants(page, limit),
    staleTime: 1000 * 60,
  });
}
