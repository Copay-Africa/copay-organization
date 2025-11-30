/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useCreateRoom } from "../../hooks/useRooms";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { X, Plus, Trash2 } from "lucide-react";
import { CreateRoomBody } from "../../types/room";
import { getCooperativeId } from "../../lib/authClient";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  // Get current cooperative ID from auth context
  const currentCooperativeId = React.useMemo(() => {
    return getCooperativeId() || "";
  }, []);

  const [formData, setFormData] = React.useState<CreateRoomBody>({
    roomNumber: "",
    roomType: "",
    floor: "",
    block: "",
    description: "",
    baseRent: 0,
    deposit: 0,
    specifications: {
      squareFeet: undefined,
      amenities: [],
      utilities: [],
      furnishing: "",
      parkingSpaces: 0,
      balcony: false,
      airConditioning: false,
    },
    cooperativeId: currentCooperativeId,
  });

  const [newAmenity, setNewAmenity] = React.useState("");
  const [newUtility, setNewUtility] = React.useState("");

  const createRoomMutation = useCreateRoom();

  const handleInputChange = (field: keyof CreateRoomBody, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecificationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          amenities: [...(prev.specifications?.amenities || []), newAmenity.trim()]
        }
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        amenities: prev.specifications?.amenities?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addUtility = () => {
    if (newUtility.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          utilities: [...(prev.specifications?.utilities || []), newUtility.trim()]
        }
      }));
      setNewUtility("");
    }
  };

  const removeUtility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        utilities: prev.specifications?.utilities?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCooperativeId) {
      alert('No cooperative context found. Please log in again.');
      return;
    }

    try {
      const submitData = {
        ...formData,
        cooperativeId: currentCooperativeId
      };

      await createRoomMutation.mutateAsync(submitData);
      onClose();
      resetForm();
    } catch (error) {

      alert('Failed to create room. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      roomType: "",
      floor: "",
      block: "",
      description: "",
      baseRent: 0,
      deposit: 0,
      specifications: {
        squareFeet: undefined,
        amenities: [],
        utilities: [],
        furnishing: "",
        parkingSpaces: 0,
        balcony: false,
        airConditioning: false,
      },
      cooperativeId: currentCooperativeId,
    });
    setNewAmenity("");
    setNewUtility("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create New Room</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => handleInputChange("roomNumber", e.target.value)}
                    placeholder="e.g., 101, A-205"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select 
                    value={formData.roomType} 
                    onValueChange={(value) => handleInputChange("roomType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1BR">1 Bedroom</SelectItem>
                      <SelectItem value="2BR">2 Bedroom</SelectItem>
                      <SelectItem value="3BR">3 Bedroom</SelectItem>
                      <SelectItem value="4BR">4 Bedroom</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => handleInputChange("floor", e.target.value)}
                    placeholder="e.g., 1st Floor, Ground"
                  />
                </div>

                <div>
                  <Label htmlFor="block">Block/Building</Label>
                  <Input
                    id="block"
                    value={formData.block}
                    onChange={(e) => handleInputChange("block", e.target.value)}
                    placeholder="e.g., Block A, East Wing"
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseRent">Base Rent (RWF) *</Label>
                  <Input
                    id="baseRent"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.baseRent}
                    onChange={(e) => handleInputChange("baseRent", parseFloat(e.target.value) || 0)}
                    placeholder="500000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deposit">Security Deposit (RWF) *</Label>
                  <Input
                    id="deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deposit}
                    onChange={(e) => handleInputChange("deposit", parseFloat(e.target.value) || 0)}
                    placeholder="1000000"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the room..."
                  rows={3}
                />
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Room Specifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="squareFeet">Square Feet</Label>
                    <Input
                      id="squareFeet"
                      type="number"
                      min="0"
                      value={formData.specifications?.squareFeet || ""}
                      onChange={(e) => handleSpecificationChange("squareFeet", parseInt(e.target.value) || undefined)}
                      placeholder="650"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                    <Input
                      id="parkingSpaces"
                      type="number"
                      min="0"
                      value={formData.specifications?.parkingSpaces || 0}
                      onChange={(e) => handleSpecificationChange("parkingSpaces", parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="furnishing">Furnishing</Label>
                    <Select 
                      value={formData.specifications?.furnishing || ""} 
                      onValueChange={(value) => handleSpecificationChange("furnishing", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select furnishing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                        <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>
                        <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specifications?.balcony || false}
                      onChange={(e) => handleSpecificationChange("balcony", e.target.checked)}
                    />
                    <span>Has Balcony</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specifications?.airConditioning || false}
                      onChange={(e) => handleSpecificationChange("airConditioning", e.target.checked)}
                    />
                    <span>Air Conditioning</span>
                  </label>
                </div>

                {/* Amenities */}
                <div>
                  <Label>Amenities</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Add amenity..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    />
                    <Button type="button" onClick={addAmenity} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specifications?.amenities?.map((amenity, index) => (
                      <div key={index} className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="text-sm">{amenity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAmenity(index)}
                          className="p-0 h-4 w-4"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utilities */}
                <div>
                  <Label>Utilities Included</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newUtility}
                      onChange={(e) => setNewUtility(e.target.value)}
                      placeholder="Add utility..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUtility())}
                    />
                    <Button type="button" onClick={addUtility} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specifications?.utilities?.map((utility, index) => (
                      <div key={index} className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="text-sm">{utility}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUtility(index)}
                          className="p-0 h-4 w-4"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRoomMutation.isPending || !formData.roomNumber || !formData.roomType}
                >
                  {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}