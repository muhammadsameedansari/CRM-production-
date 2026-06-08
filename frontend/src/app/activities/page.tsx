'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api, Activity } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.activities().then((res) => setActivities(res.data)).finally(() => setLoading(false));
  }, []);

  const entityColors: Record<string, string> = {
    Lead: 'bg-blue-500/10 text-blue-500',
    Client: 'bg-emerald-500/10 text-emerald-500',
    Task: 'bg-purple-500/10 text-purple-500',
    Revenue: 'bg-amber-500/10 text-amber-500',
    File: 'bg-cyan-500/10 text-cyan-500',
    User: 'bg-pink-500/10 text-pink-500',
    System: 'bg-slate-500/10 text-slate-500',
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Activity Logs" description="Complete audit trail of all actions">
        {loading ? <PageLoader /> : (
          <Card className="glass">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {activities.map((activity, i) => (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {getInitials(activity.user?.name || 'S')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user?.name}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(activity.timestamp)}</p>
                    </div>
                    <Badge className={entityColors[activity.entityType] || entityColors.System}>{activity.entityType}</Badge>
                  </motion.div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">No activity recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
