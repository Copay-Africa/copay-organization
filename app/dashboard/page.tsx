"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useUserStats } from "../../hooks/useTenants";
import { usePaymentStats } from "../../hooks/usePaymentStats";
import { useComplaintStats } from "../../hooks/useComplaintStats";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Users, DollarSign, AlertCircle, TrendingUp, Activity, Clock } from "lucide-react";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className="text-xs text-muted-foreground">{change}</p>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your cooperative management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={userStats?.totalTenants || 0}
          change={`${userStats?.recentRegistrations || 0} new this month`}
          icon={Users}
          isLoading={userStatsLoading}
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
          value={paymentStats?.summary.totalAmount 
            ? formatCurrency(paymentStats.summary.totalAmount) 
            : 'RWF 0'
          }
          change={`${paymentStats?.summary.totalPayments || 0} payments`}
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

      {/* Detailed Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
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
                    <p className="text-sm text-muted-foreground">Average Amount</p>
                    <p className="text-2xl font-bold">
                      {paymentStats?.summary.averageAmount 
                        ? formatCurrency(paymentStats.summary.averageAmount)
                        : 'RWF 0'
                      }
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
    </div>
  );
}
