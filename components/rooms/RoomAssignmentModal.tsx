"use client";
import React from "react";
import { useAssignRoom, useUnassignRoom } from "../../hooks/useRooms";
import { useTenants } from "../../hooks/useTenants";
import { getCooperativeId } from "../../lib/authClient";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { X, UserPlus, UserMinus, Search } from "lucide-react";
import { Room } from "../../types/room";
import { Tenant } from "../../hooks/useTenants";

interface RoomAssignmentModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomAssignmentModal({ room, isOpen, onClose }: RoomAssignmentModalProps) {
  const [mode, setMode] = React.useState<'assign' | 'unassign'>(
    room.status === 'OCCUPIED' && room.currentTenant ? 'unassign' : 'assign'
  );
  const [selectedTenantId, setSelectedTenantId] = React.useState("");
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [unassignReason, setUnassignReason] = React.useState("");
  const [tenantSearch, setTenantSearch] = React.useState("");

  // Get current cooperative context
  const cooperativeId = getCooperativeId();

  // Fetch available tenants for assignment
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    limit: 100,
    search: tenantSearch,
  });

  // Filter tenants on the client side since the API doesn't support role filtering
  const availableTenants = React.useMemo(() => {
    if (!tenantsData?.data) return [];
    return tenantsData.data.filter(tenant => tenant.role === 'TENANT');
  }, [tenantsData]);

  const assignRoomMutation = useAssignRoom();
  const unassignRoomMutation = useUnassignRoom();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cooperativeId) {
      alert('No cooperative context found. Please log in again.');
      return;
    }
    
    if (!selectedTenantId) {
      alert('Please select a tenant');
      return;
    }

    try {
      await assignRoomMutation.mutateAsync({
        roomId: room.id,
        body: {
          userId: selectedTenantId,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          notes: notes || undefined,
        }
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error assigning room:', error);
      alert('Failed to assign room. The tenant may already have a room in this cooperative.');
    }
  };

  const handleUnassign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cooperativeId) {
      alert('No cooperative context found. Please log in again.');
      return;
    }
    
    if (!unassignReason.trim()) {
      alert('Please provide a reason for unassignment');
      return;
    }

    if (!room.currentTenant) {
      alert('No tenant currently assigned to this room');
      return;
    }

    try {
      await unassignRoomMutation.mutateAsync({
        roomId: room.id,
        body: {
          userId: room.currentTenant.id,
          reason: unassignReason,
        }
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error unassigning room:', error);
      alert('Failed to unassign room.');
    }
  };

  const resetForm = () => {
    setSelectedTenantId("");
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate("");
    setNotes("");
    setUnassignReason("");
    setTenantSearch("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {mode === 'assign' ? (
                <>Assign Tenant to Room {room.roomNumber}</>
              ) : (
                <>Unassign Tenant from Room {room.roomNumber}</>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {room.status === 'OCCUPIED' && room.currentTenant && (
                <div className="flex gap-2">
                  <Button 
                    variant={mode === 'assign' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => setMode('assign')}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                  <Button 
                    variant={mode === 'unassign' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => setMode('unassign')}
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unassign
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Current Tenant Info */}
            {room.currentTenant && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Currently Assigned</h3>
                <div className="text-sm">
                  <p><strong>Tenant:</strong> {room.currentTenant.firstName} {room.currentTenant.lastName}</p>
                  <p><strong>Phone:</strong> {room.currentTenant.phone}</p>
                  {room.currentTenant.email && (
                    <p><strong>Email:</strong> {room.currentTenant.email}</p>
                  )}
                  <p><strong>Assigned Since:</strong> {new Date(room.currentTenant.assignedAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {mode === 'assign' ? (
              <form onSubmit={handleAssign} className="space-y-6">
                {/* Tenant Selection */}
                <div>
                  <Label htmlFor="tenantSearch">Search & Select Tenant *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tenantSearch"
                        value={tenantSearch}
                        onChange={(e) => setTenantSearch(e.target.value)}
                        placeholder="Search tenants by name or phone..."
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenantsLoading ? (
                          <SelectItem value="loading" disabled>Loading tenants...</SelectItem>
                        ) : availableTenants.length === 0 ? (
                          <SelectItem value="none" disabled>No tenants found</SelectItem>
                        ) : (
                          availableTenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.firstName} {tenant.lastName} - {tenant.phone}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Assignment Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Assignment Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about the assignment..."
                    rows={3}
                  />
                </div>

                {/* Assignment Info */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Assignment Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Each tenant can have only one room per cooperative</li>
                    <li>• Room status will automatically change to OCCUPIED</li>
                    <li>• Assignment will be logged in the room's history</li>
                  </ul>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={assignRoomMutation.isPending || !selectedTenantId}
                  >
                    {assignRoomMutation.isPending ? "Assigning..." : "Assign Tenant"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUnassign} className="space-y-6">
                {/* Unassignment Reason */}
                <div>
                  <Label htmlFor="unassignReason">Reason for Unassignment *</Label>
                  <Textarea
                    id="unassignReason"
                    value={unassignReason}
                    onChange={(e) => setUnassignReason(e.target.value)}
                    placeholder="Please provide a reason for unassigning this tenant..."
                    rows={4}
                    required
                  />
                </div>

                {/* Unassignment Info */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-destructive">Unassignment Effects</h4>
                  <ul className="text-sm text-destructive space-y-1">
                    <li>• Room status will change to AVAILABLE</li>
                    <li>• Assignment will be marked as ended with reason</li>
                    <li>• This action cannot be undone</li>
                    <li>• Consider any pending payments before unassigning</li>
                  </ul>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={unassignRoomMutation.isPending || !unassignReason.trim()}
                  >
                    {unassignRoomMutation.isPending ? "Unassigning..." : "Unassign Tenant"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}