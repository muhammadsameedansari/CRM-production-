'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Calendar, Clock, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { PageLoader, EmptyState } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { api, Notification } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const typeIcons: Record<string, typeof Bell> = {
  'Follow Up Reminder': AlertCircle,
  'Meeting Reminder': Calendar,
  'Task Reminder': Clock,
  System: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const res = await api.notifications.getAll();
    setNotifications(res.data);
  };

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.notifications.markAllAsRead();
    fetchNotifications();
  };

  const markRead = async (id: string) => {
    await api.notifications.markAsRead(id);
    fetchNotifications();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Notifications" description="Follow-ups, meetings, and task reminders">
        <div className="space-y-6">
          {notifications.some((n) => !n.isRead) && (
            <Button variant="outline" onClick={markAllRead} className="w-full sm:w-auto">
              <CheckCheck className="h-4 w-4 mr-2" /> Mark All as Read
            </Button>
          )}

          {loading ? <PageLoader /> : notifications.length === 0 ? (
            <EmptyState title="All caught up!" description="No notifications at the moment" />
          ) : (
            <div className="space-y-3">
              {notifications.map((notif, i) => {
                const Icon = typeIcons[notif.type] || Bell;
                return (
                  <motion.div key={notif._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className={`glass transition-all cursor-pointer ${!notif.isRead ? 'border-primary/30 bg-primary/5' : ''}`} onClick={() => !notif.isRead && markRead(notif._id)}>
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${!notif.isRead ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon className={`h-5 w-5 ${!notif.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{notif.title}</h4>
                            {!notif.isRead && <Badge className="bg-primary/10 text-primary text-[10px]">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatDate(notif.createdAt)}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{notif.type}</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
