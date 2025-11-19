"use client";
import React from "react";
import { useRooms, useDeleteRoom } from "../../hooks/useRooms";
import { getCooperativeId } from "../../lib/authClient";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Skeleton } from "../ui/Skeleton";
import CreateRoomModal from "./CreateRoomModal";
import EditRoomModal from "./EditRoomModal";
import RoomAssignmentModal from "./RoomAssignmentModal";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  UserPlus, 
  UserMinus,
  Building,
  BedDouble,
  MapPin,
  DollarSign,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { Room, RoomStatus } from "../../types/room";

const ROOM_STATUSES: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'OUT_OF_SERVICE'];

const STATUS_COLORS: Record<RoomStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  OCCUPIED: "bg-blue-100 text-blue-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  RESERVED: "bg-purple-100 text-purple-800",
  OUT_OF_SERVICE: "bg-red-100 text-red-800",
};

export default function RoomsManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [assigningRoom, setAssigningRoom] = React.useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  
  // Get cooperative context
  const cooperativeId = getCooperativeId();
  
  const filters = React.useMemo(() => {
    const filterObj = {
      page: currentPage,
      limit: 12,
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== "all" && { status: statusFilter as RoomStatus }),
      ...(roomTypeFilter !== "all" && { roomType: roomTypeFilter }),
    };
    
    console.log('Rooms filters:', filterObj);
    return filterObj;
  }, [currentPage, searchTerm, statusFilter, roomTypeFilter]);

  const { data, isLoading, isError, error } = useRooms(filters);
  const deleteRoomMutation = useDeleteRoom();
  
  const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
    if (window.confirm(`Are you sure you want to delete room ${roomNumber}? This action cannot be undone.`)) {
      try {
        await deleteRoomMutation.mutateAsync(roomId);
      } catch (err) {
        console.error('Delete room error:', err);
        alert('Failed to delete room. It may have active assignments or payment history.');
      }
    }
  };

  // Show error if no cooperative context
  if (!cooperativeId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Cooperative Context</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load rooms. Please ensure you&apos;re logged in with a valid cooperative account.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading rooms: {error?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Room Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage rooms, assignments, and availability
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by room number, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ROOM_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="1BR">1 Bedroom</SelectItem>
                <SelectItem value="2BR">2 Bedroom</SelectItem>
                <SelectItem value="3BR">3 Bedroom</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {data && (
        <div className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.meta.total} rooms
        </div>
      )}

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No rooms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || roomTypeFilter !== "all"
                ? "No rooms match your current filters."
                : "Get started by creating your first room."}
            </p>
            {(!searchTerm && statusFilter === "all" && roomTypeFilter === "all") && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Room Header */}
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{room.roomNumber}</h3>
                      <p className="text-sm text-muted-foreground">{room.roomType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[room.status]}>
                        {room.status.replace('_', ' ')}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Room
                          </DropdownMenuItem>
                          {room.status === 'AVAILABLE' && (
                            <DropdownMenuItem onClick={() => setAssigningRoom(room)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Tenant
                            </DropdownMenuItem>
                          )}
                          {room.status === 'OCCUPIED' && room.currentTenant && (
                            <DropdownMenuItem onClick={() => setAssigningRoom(room)}>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Unassign Tenant
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-4 space-y-3">
                  {(room.floor || room.block) && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {[room.block, room.floor].filter(Boolean).join(', ')}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {new Intl.NumberFormat('en-RW', {
                        style: 'currency',
                        currency: 'RWF',
                        minimumFractionDigits: 0,
                      }).format(room.baseRent)}/month
                    </div>
                    {room.specifications?.squareFeet && (
                      <div className="text-sm text-muted-foreground">
                        {room.specifications.squareFeet} sq ft
                      </div>
                    )}
                  </div>

                  {room.currentTenant && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {room.currentTenant.firstName} {room.currentTenant.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Since {new Date(room.currentTenant.assignedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {room.specifications?.amenities && room.specifications.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.specifications.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.specifications.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{room.specifications.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {room.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!data.meta.hasPreviousPage}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!data.meta.hasNextPage}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      {editingRoom && (
        <EditRoomModal 
          room={editingRoom}
          isOpen={!!editingRoom} 
          onClose={() => setEditingRoom(null)} 
        />
      )}

      {assigningRoom && (
        <RoomAssignmentModal 
          room={assigningRoom}
          isOpen={!!assigningRoom} 
          onClose={() => setAssigningRoom(null)} 
        />
      )}
    </div>
  );
}