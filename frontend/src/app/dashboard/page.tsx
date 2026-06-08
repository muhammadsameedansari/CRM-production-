'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, Trophy, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { StatCard, PageLoader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api, DashboardData } from '@/lib/api';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';

const CHART_COLORS = ['#af93f0', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.get().then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const chartData = data?.monthlyRevenueChart.map((item) => ({
    name: MONTHS[item._id.month - 1],
    revenue: item.total,
  })) || [];

  const pieData = data?.leadsByStatus.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard" description="Overview of your agency performance">
        {loading ? <PageLoader /> : data && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard title="Total Leads" value={data.stats.totalLeads} icon={Users} delay={0} />
              <StatCard title="Active Leads" value={data.stats.activeLeads} icon={UserCheck} color="text-cyan-500" delay={1} />
              <StatCard title="Meetings" value={data.stats.meetingsScheduled} icon={Calendar} color="text-purple-500" delay={2} />
              <StatCard title="Closed Deals" value={data.stats.closedDeals} icon={Trophy} color="text-emerald-500" delay={3} />
              <StatCard title="Total Revenue" value={data.stats.totalRevenue} icon={DollarSign} color="text-amber-500" delay={4} />
              <StatCard title="Monthly Revenue" value={data.stats.monthlyRevenue} icon={TrendingUp} color="text-green-500" delay={5} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg">Leads by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentActivities.map((activity, i) => (
                    <motion.div
                      key={activity._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(activity.user?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm"><span className="font-medium">{activity.user?.name}</span> {activity.action}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))}
                  {data.recentActivities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
