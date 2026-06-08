'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
    >
      <Card className="glass overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-2">{typeof value === 'number' && title.includes('Revenue') ? formatCurrency(value) : value}</p>
              {trend && <p className="text-xs text-emerald-500 mt-1">{trend}</p>}
            </div>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform', color)}>
              <Icon className={cn('h-6 w-6', color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
