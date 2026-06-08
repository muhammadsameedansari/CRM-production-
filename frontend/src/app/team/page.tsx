'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Trophy, DollarSign, CheckSquare } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api, User } from '@/lib/api';
import { formatCurrency, getInitials } from '@/lib/utils';

export default function TeamPage() {
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.team().then((res) => setTeam(res.data)).finally(() => setLoading(false));
  }, []);

  const metrics = [
    { key: 'leadsAdded', label: 'Leads Added', icon: Users, color: 'text-blue-500' },
    { key: 'meetingsBooked', label: 'Meetings', icon: Calendar, color: 'text-purple-500' },
    { key: 'dealsClosed', label: 'Deals Closed', icon: Trophy, color: 'text-emerald-500' },
    { key: 'revenueGenerated', label: 'Revenue', icon: DollarSign, color: 'text-amber-500', format: formatCurrency },
    { key: 'tasksCompleted', label: 'Tasks Done', icon: CheckSquare, color: 'text-cyan-500' },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Team Performance" description="Track individual team member metrics">
        {loading ? <PageLoader /> : (
          <div className="grid gap-6 md:grid-cols-2">
            {team.map((member, i) => (
              <motion.div key={member._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/20 text-primary">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {metrics.map((metric) => {
                        const value = member.stats?.[metric.key as keyof typeof member.stats] || 0;
                        return (
                          <div key={metric.key} className="text-center p-3 rounded-lg bg-muted/30">
                            <metric.icon className={`h-5 w-5 mx-auto mb-1 ${metric.color}`} />
                            <p className="text-lg font-bold">
                              {metric.format ? metric.format(value) : value}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
