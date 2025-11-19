"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export type CreateUserBody = {
  phone: string;
  pin: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'TENANT' | 'ORGANIZATION_ADMIN';
  cooperativeId?: string;
};

export type UpdateUserStatusBody = {
  isActive: boolean;
};

export type UserStats = {
  totalUsers: number;
  totalTenants: number;
  totalOrgAdmins: number;
  totalSuperAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  recentRegistrations: number;
};

export type UserFilters = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
};

async function fetchTenants(filters: UserFilters = {}) {
  const token = getToken();
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/users?${params.toString()}` 
    : `/users?${params.toString()}`;

  console.log('🔍 Fetching tenants from:', url);
  console.log('🔍 Filters applied:', filters);

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

    throw new Error(text || `Failed to fetch users: ${res.status}`);
  }

  const data = (await res.json()) as TenantsResponse;
  console.log('🔍 API Response:', data);
  return data;
}

async function createUser(body: CreateUserBody) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/users` 
    : `/users`;

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
    throw new Error(text || `Failed to create user: ${res.status}`);
  }

  const data = (await res.json()) as Tenant;
  return data;
}

async function updateUserStatus(id: string, body: UpdateUserStatusBody) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/users/${id}/status` 
    : `/users/${id}/status`;

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
    throw new Error(text || `Failed to update user status: ${res.status}`);
  }

  const data = (await res.json()) as Tenant;
  return data;
}

async function fetchUserStats() {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = base 
    ? `${base.replace(/\/$/, "")}/users/stats` 
    : `/users/stats`;

  console.log('📊 Fetching user stats from:', url);

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch user stats: ${res.status}`);
  }

  const data = (await res.json()) as UserStats;
  console.log('📊 User stats response:', data);
  return data;
}

export function useTenants(filters: UserFilters = {}) {
  // Set default values if not provided
  const finalFilters = {
    page: 1,
    limit: 10,
    ...filters,
  };

  return useQuery<TenantsResponse, Error>({
    queryKey: ["tenants", finalFilters],
    queryFn: () => fetchTenants(finalFilters),
    staleTime: 1000 * 60,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation<Tenant, Error, CreateUserBody>({
    mutationFn: (body) => createUser(body),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      // Invalidate user stats to refresh them
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation<Tenant, Error, { id: string; body: UpdateUserStatusBody }>({
    mutationFn: ({ id, body }) => updateUserStatus(id, body),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      // Invalidate user stats to refresh them
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useUserStats() {
  return useQuery<UserStats, Error>({
    queryKey: ["userStats"],
    queryFn: () => fetchUserStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
