"use client";
import React from "react";
import { useTenants, useUpdateUserStatus } from "../../hooks/useTenants";
// Using native HTML table elements with Tailwind styling
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Skeleton } from "../ui/Skeleton";
import CreateTenantModal from "./CreateTenantModal";
import { Search, UserPlus, MoreHorizontal, Eye, UserX, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";

export default function TenantsList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const filters = React.useMemo(() => ({
    page: currentPage,
    limit: 10,
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(roleFilter !== "all" && { role: roleFilter }),
  }), [currentPage, searchTerm, statusFilter, roleFilter]);

  const { data, isLoading, isError, error } = useTenants(filters);
  const updateUserStatusMutation = useUpdateUserStatus();

  const handleStatusChange = (userId: string, isActive: boolean) => {
    updateUserStatusMutation.mutate({ id: userId, body: { isActive } });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'organization_admin':
        return 'default';
      case 'tenant':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading users: {error?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Users Management
            </CardTitle>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="TENANT">Tenants</SelectItem>
                <SelectItem value="ORGANIZATION_ADMIN">Org Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Login</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[70px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </td>
                      <td className="p-4 align-middle"><Skeleton className="h-6 w-20" /></td>
                      <td className="p-4 align-middle"><Skeleton className="h-6 w-15" /></td>
                      <td className="p-4 align-middle"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4 align-middle"><Skeleton className="h-8 w-8" /></td>
                    </tr>
                  ))
                ) : data?.data.length === 0 ? (
                  <tr className="border-b border-border transition-colors">
                    <td colSpan={6} className="h-32 text-center text-muted-foreground p-4">
                      No users found
                    </td>
                  </tr>
                ) : (
                  data?.data.map((user) => (
                    <tr key={user.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="space-y-1">
                          <div className="text-sm">{user.phone}</div>
                          {user.email && (
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={getRoleBadgeVariant(user.role || '')}>
                          {user.role === 'ORGANIZATION_ADMIN' ? 'Org Admin' : user.role || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={getStatusBadgeVariant(user.status || '')}>
                          {user.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-muted-foreground">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {user.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, false)}
                                disabled={updateUserStatusMutation.isPending}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, true)}
                                disabled={updateUserStatusMutation.isPending}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((data.meta.page - 1) * data.meta.limit) + 1} to{" "}
                {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{" "}
                {data.meta.total} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(data.meta.page - 1)}
                  disabled={!data.meta.hasPreviousPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(data.meta.page + 1)}
                  disabled={!data.meta.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <CreateTenantModal 
          open={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}
    </div>
  );
}
