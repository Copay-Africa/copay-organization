"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useUserStats, useTenants } from "../../hooks/useTenants";
import { usePaymentStats } from "../../hooks/usePaymentStats";
import { useComplaintStats } from "../../hooks/useComplaintStats";
import { useRoomStats } from "../../hooks/useRooms";
import { getCooperativeId } from "../../lib/authClient";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Users, DollarSign, AlertCircle, TrendingUp, Activity, Clock, Building, BedDouble, Home, Wrench } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
}

function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  isLoading = false 
}: { 
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 sm:h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-xl sm:text-2xl font-bold leading-tight">{value}</div>
            {change && (
              <p className="text-xs text-muted-foreground mt-1">{change}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: paymentStats, isLoading: paymentStatsLoading } = usePaymentStats();
  const { data: complaintStats, isLoading: complaintStatsLoading } = useComplaintStats();
  const { data: roomStats, isLoading: roomStatsLoading } = useRoomStats();
  
  // Get current cooperative context
  const cooperativeId = getCooperativeId();
  
  // Also fetch tenants directly to get accurate count
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({ 
    limit: 100, // Get more data to ensure we capture all users
  });
  
  // Filter tenants on client side
  const tenants = React.useMemo(() => {
    if (!tenantsData?.data) return [];
    return tenantsData.data.filter(user => user.role === 'TENANT');
  }, [tenantsData]);
  
  // Also fetch all users to see the difference
  const { data: allUsersData } = useTenants({ 
    limit: 100, // Get all users without any filters
  });

  // Debug logging for user stats

  // Use the client-side filtered tenant count
  const getTenantCount = () => {
    // Use the filtered tenants count if available
    if (tenants.length > 0) {
      return tenants.length;
    }
    
    // If we have all users data, manually count tenants
    if (allUsersData) {
      const tenantCount = allUsersData.data.filter(user => 
        user.role === 'TENANT' || user.role === 'tenant'
      ).length;
      if (tenantCount > 0) {
        return tenantCount;
      }
    }
    
    // Otherwise fallback to user stats
    return userStats?.totalTenants ?? 0;
  };

  const tenantCount = getTenantCount();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Overview of your cooperative management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={userStatsLoading && tenantsLoading ? "Loading..." : tenantCount.toLocaleString()}
          change={`${userStats?.recentRegistrations || 0} new this month`}
          icon={Users}
          isLoading={userStatsLoading && tenantsLoading}
        />
        
        <StatCard
          title="Active Users"
          value={userStats?.activeUsers || 0}
          change={`${userStats?.inactiveUsers || 0} inactive`}
          icon={Activity}
          isLoading={userStatsLoading}
        />

        <StatCard
          title="Total Revenue"
          value={(() => {
            // Calculate revenue only from completed payments
            const completedPaymentsTotal = paymentStats?.statusBreakdown
              .find(status => status.status === 'COMPLETED')?.totalAmount || 0;
            return formatCurrency(completedPaymentsTotal);
          })()}
          change={`${paymentStats?.statusBreakdown
            .find(status => status.status === 'COMPLETED')?.count || 0} completed payments`}
          icon={DollarSign}
          isLoading={paymentStatsLoading}
        />
        
        <StatCard
          title="Open Complaints"
          value={complaintStats?.statusBreakdown.find(s => s.status === 'OPEN')?.count || 0}
          change={`${complaintStats?.summary.totalComplaints || 0} total`}
          icon={AlertCircle}
          isLoading={complaintStatsLoading}
        />
      </div>

      {/* Room Statistics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Rooms"
          value={roomStats?.total || 0}
          change={`${roomStats?.occupancyRate ? Math.round(roomStats.occupancyRate) : 0}% occupancy rate`}
          icon={Building}
          isLoading={roomStatsLoading}
        />
        
        <StatCard
          title="Available Rooms"
          value={roomStats?.available || 0}
          change={`${roomStats?.occupied || 0} currently occupied`}
          icon={Home}
          isLoading={roomStatsLoading}
        />
        
        <StatCard
          title="Occupied Rooms"
          value={roomStats?.occupied || 0}
          change={`${roomStats?.available || 0} available for rent`}
          icon={BedDouble}
          isLoading={roomStatsLoading}
        />
        
        <StatCard
          title="Rooms Needing Attention"
          value={(roomStats?.maintenance || 0) + (roomStats?.outOfService || 0)}
          change={`${roomStats?.maintenance || 0} maintenance, ${roomStats?.outOfService || 0} out of service`}
          icon={Wrench}
          isLoading={roomStatsLoading}
        />
      </div>

      {/* Detailed Sections */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* User Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userStatsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm font-medium">Tenants</span>
                    <span className="text-lg font-bold text-blue-600">
                      {(userStats?.totalTenants || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm font-medium">Organization Admins</span>
                    <span className="text-lg font-bold text-green-600">
                      {(userStats?.totalOrgAdmins || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {(userStats?.activeUsers || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm font-medium">Inactive Users</span>
                    <span className="text-lg font-bold text-red-600">
                      {(userStats?.inactiveUsers || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentStatsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="text-2xl font-bold">{paymentStats?.summary.totalPayments || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Revenue</p>
                    <p className="text-2xl font-bold">
                      {(() => {
                        const completedPaymentsTotal = paymentStats?.statusBreakdown
                          .find(status => status.status === 'COMPLETED')?.totalAmount || 0;
                        return formatCurrency(completedPaymentsTotal);
                      })()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Status</p>
                  <div className="flex flex-wrap gap-2">
                    {paymentStats?.statusBreakdown.map((status) => (
                      <Badge
                        key={status.status}
                        variant={
                          status.status === 'COMPLETED' ? 'success' :
                          status.status === 'PENDING' ? 'warning' :
                          status.status === 'FAILED' ? 'destructive' : 'secondary'
                        }
                      >
                        {status.status}: {status.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaints Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complaintStatsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Complaint Status</p>
                  <div className="flex flex-wrap gap-2">
                    {complaintStats?.statusBreakdown.map((status) => (
                      <Badge
                        key={status.status}
                        variant={
                          status.status === 'RESOLVED' ? 'success' :
                          status.status === 'IN_PROGRESS' ? 'warning' :
                          status.status === 'OPEN' ? 'destructive' : 'secondary'
                        }
                      >
                        {status.status}: {status.count}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Priority Breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {complaintStats?.priorityBreakdown.map((priority) => (
                      <Badge
                        key={priority.priority}
                        variant={
                          priority.priority === 'HIGH' ? 'destructive' :
                          priority.priority === 'MEDIUM' ? 'warning' : 'secondary'
                        }
                      >
                        {priority.priority}: {priority.count}
                      </Badge>
                    ))}
                  </div>
                </div>

                {complaintStats?.recentComplaints && complaintStats.recentComplaints.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recent Complaints</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {complaintStats.recentComplaints.slice(0, 3).map((complaint) => (
                        <div key={complaint.id} className="text-sm p-2 border rounded">
                          <p className="font-medium truncate">{complaint.title}</p>
                          <p className="text-muted-foreground">
                            {complaint.user} • {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {paymentStats?.recentPayments && paymentStats.recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {paymentStats.recentPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <p className="font-medium">{payment.paymentType}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.sender} • {payment.senderPhone}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    <Badge
                      variant={
                        payment.status === 'COMPLETED' ? 'success' :
                        payment.status === 'PENDING' ? 'warning' : 'destructive'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <a
              href="/rooms"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <Building className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
              <div>
                <div className="font-semibold">Manage Rooms</div>
                <div className="text-sm text-muted-foreground">Set room rates in RWF</div>
              </div>
            </a>
            
            <a
              href="/dashboard/tenants"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <Users className="h-8 w-8 text-green-600 group-hover:text-green-700" />
              <div>
                <div className="font-semibold">Manage Tenants</div>
                <div className="text-sm text-muted-foreground">View tenant list</div>
              </div>
            </a>
            
            <a
              href="/dashboard/payments"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <DollarSign className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
              <div>
                <div className="font-semibold">View Payments</div>
                <div className="text-sm text-muted-foreground">Track RWF payments</div>
              </div>
            </a>
            
            <a
              href="/dashboard/complaints"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <AlertCircle className="h-8 w-8 text-orange-600 group-hover:text-orange-700" />
              <div>
                <div className="font-semibold">Handle Complaints</div>
                <div className="text-sm text-muted-foreground">Manage issues</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
