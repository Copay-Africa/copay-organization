"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken, getCooperativeId } from "../lib/authClient";
import {
  Room,
  RoomsResponse,
  RoomFilters,
  CreateRoomBody,
  UpdateRoomBody,
  AssignRoomBody,
  UnassignRoomBody,
  RoomStats,
  CooperativeRoomAssignments,
  RoomAssignment,
} from "../types/room";

// API Base URL
const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  return base.replace(/\/$/, "");
};

// API Functions
async function fetchRooms(filters: RoomFilters = {}) {
  const token = getToken();
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const url = `${getApiBase()}/rooms?${params.toString()}`;

  console.log("🏠 Fetching rooms from:", url);
  console.log("🏠 Filters applied:", filters);

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch rooms: ${res.status}`);
  }

  const data = (await res.json()) as RoomsResponse;
  console.log("🏠 API Response:", data);
  return data;
}

async function fetchRoomById(id: string) {
  const token = getToken();
  const url = `${getApiBase()}/rooms/${id}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch room: ${res.status}`);
  }

  const data = (await res.json()) as Room;
  return data;
}

async function createRoom(body: CreateRoomBody) {
  const token = getToken();
  const url = `${getApiBase()}/rooms`;

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
    throw new Error(text || `Failed to create room: ${res.status}`);
  }

  const data = (await res.json()) as Room;
  return data;
}

async function updateRoom(id: string, body: UpdateRoomBody) {
  const token = getToken();
  const url = `${getApiBase()}/rooms/${id}`;

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
    throw new Error(text || `Failed to update room: ${res.status}`);
  }

  const data = (await res.json()) as Room;
  return data;
}

async function deleteRoom(id: string) {
  const token = getToken();
  const url = `${getApiBase()}/rooms/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to delete room: ${res.status}`);
  }

  return { success: true as const };
}

async function assignRoom(roomId: string, body: AssignRoomBody) {
  const token = getToken();
  const url = `${getApiBase()}/rooms/${roomId}/assign`;

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
    throw new Error(text || `Failed to assign room: ${res.status}`);
  }

  const data = (await res.json()) as RoomAssignment;
  return data;
}

async function unassignRoom(roomId: string, body: UnassignRoomBody) {
  const token = getToken();
  const url = `${getApiBase()}/rooms/${roomId}/unassign`;

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
    throw new Error(text || `Failed to unassign room: ${res.status}`);
  }

  const data = (await res.json()) as { success: true };
  return data;
}

async function fetchRoomStats() {
  const token = getToken();
  const cooperativeId = getCooperativeId();
  const url = `${getApiBase()}/rooms/stats${cooperativeId ? `?cooperativeId=${cooperativeId}` : ''}`;

  console.log("📊 Fetching room stats from:", url);

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch room stats: ${res.status}`);
  }

  const data = (await res.json()) as RoomStats;
  console.log("📊 Room stats response:", data);
  return data;
}

async function fetchCooperativeRoomAssignments(cooperativeId: string) {
  const token = getToken();
  const url = `${getApiBase()}/rooms/assignments/cooperative/${cooperativeId}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      text || `Failed to fetch cooperative room assignments: ${res.status}`
    );
  }

  const data = (await res.json()) as CooperativeRoomAssignments;
  return data;
}

// React Query Hooks
export function useRooms(filters: RoomFilters = {}) {
  const cooperativeId = getCooperativeId();
  
  const finalFilters = {
    page: 1,
    limit: 10,
    ...filters,
    // Always filter by current cooperative ID for organization admin
    ...(cooperativeId && { cooperativeId }),
  };

  return useQuery<RoomsResponse, Error>({
    queryKey: ["rooms", finalFilters],
    queryFn: () => fetchRooms(finalFilters),
    staleTime: 1000 * 60,
    // Only fetch if we have a cooperative context
    enabled: !!cooperativeId,
  });
}

export function useRoom(id: string | undefined) {
  return useQuery<Room, Error>({
    queryKey: ["room", id],
    queryFn: () => fetchRoomById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation<Room, Error, CreateRoomBody>({
    mutationFn: (body) => createRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation<Room, Error, { id: string; body: UpdateRoomBody }>({
    mutationFn: ({ id, body }) => updateRoom(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room", data.id] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation<{ success: true }, Error, string>({
    mutationFn: (id) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
    },
  });
}

export function useAssignRoom() {
  const queryClient = useQueryClient();

  return useMutation<
    RoomAssignment,
    Error,
    { roomId: string; body: AssignRoomBody }
  >({
    mutationFn: ({ roomId, body }) => assignRoom(roomId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useUnassignRoom() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: true },
    Error,
    { roomId: string; body: UnassignRoomBody }
  >({
    mutationFn: ({ roomId, body }) => unassignRoom(roomId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useRoomStats() {
  const cooperativeId = getCooperativeId();
  
  return useQuery<RoomStats, Error>({
    queryKey: ["roomStats", cooperativeId],
    queryFn: () => fetchRoomStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!cooperativeId,
  });
}

export function useCooperativeRoomAssignments(
  cooperativeId: string | undefined
) {
  return useQuery<CooperativeRoomAssignments, Error>({
    queryKey: ["cooperativeRoomAssignments", cooperativeId],
    queryFn: () => fetchCooperativeRoomAssignments(cooperativeId!),
    enabled: !!cooperativeId,
    staleTime: 1000 * 60,
  });
}
