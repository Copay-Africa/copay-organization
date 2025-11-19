export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED' | 'OUT_OF_SERVICE';

export type RoomSpecifications = {
  squareFeet?: number;
  amenities?: string[];
  utilities?: string[];
  furnishing?: string;
  parkingSpaces?: number;
  balcony?: boolean;
  airConditioning?: boolean;
};

export type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  floor?: string;
  block?: string;
  description?: string;
  baseRent: number;
  deposit: number;
  status: RoomStatus;
  specifications?: RoomSpecifications;
  cooperativeId: string;
  cooperativeName?: string;
  currentTenant?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    assignedAt: string;
  };
  assignmentHistory?: RoomAssignment[];
  createdAt: string;
  updatedAt: string;
};

export type RoomAssignment = {
  id: string;
  roomId: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  assignedBy: string;
  assignedByName?: string;
  unassignedBy?: string;
  unassignedByName?: string;
  unassignedAt?: string;
  unassignedReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRoomBody = {
  roomNumber: string;
  roomType: string;
  floor?: string;
  block?: string;
  description?: string;
  baseRent: number;
  deposit: number;
  specifications?: RoomSpecifications;
  cooperativeId: string;
};

export type UpdateRoomBody = Partial<Omit<CreateRoomBody, 'cooperativeId'>> & {
  status?: RoomStatus;
};

export type AssignRoomBody = {
  userId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
};

export type UnassignRoomBody = {
  userId: string;
  reason: string;
};

export type RoomFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RoomStatus;
  roomType?: string;
  floor?: string;
  block?: string;
  cooperativeId?: string;
  isOccupied?: boolean;
  minRent?: number;
  maxRent?: number;
};

export type RoomsResponse = {
  data: Room[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type RoomStats = {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
  reserved: number;
  outOfService: number;
  occupancyRate: number;
  byType?: Array<{
    roomType: string;
    count: number;
  }>;
  byFloor?: Array<{
    floor: string;
    count: number;
  }>;
  byBlock?: Array<{
    block: string;
    count: number;
  }>;
};

export type CooperativeRoomAssignments = {
  cooperativeId: string;
  cooperativeName: string;
  assignments: Array<{
    userId: string;
    userName: string;
    userPhone: string;
    roomId: string;
    roomNumber: string;
    roomType: string;
    assignedAt: string;
  }>;
};