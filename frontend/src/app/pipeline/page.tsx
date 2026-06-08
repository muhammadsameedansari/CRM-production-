'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
  DragStartEvent, DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api, Lead } from '@/lib/api';
import { LEAD_STATUSES, getInitials } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const PIPELINE_STATUSES = LEAD_STATUSES.filter((s) => !['Won', 'Lost'].includes(s));

const STATUS_HEADER_COLORS: Record<string, string> = {
  New: 'border-t-blue-500',
  Contacted: 'border-t-cyan-500',
  Interested: 'border-t-emerald-500',
  'Meeting Scheduled': 'border-t-purple-500',
  'Proposal Sent': 'border-t-amber-500',
  Negotiation: 'border-t-orange-500',
};

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-border/50">
        <CardContent className="p-4">
          <h4 className="font-medium text-sm">{lead.companyName}</h4>
          <p className="text-xs text-muted-foreground mt-1">{lead.contactPerson}</p>
          <div className="flex items-center justify-between mt-3">
            {lead.assignedTo && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {getInitials(lead.assignedTo.name)}
                </AvatarFallback>
              </Avatar>
            )}
            {lead.aiScore !== undefined && (
              <Badge variant="outline" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />{lead.aiScore}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({ status, leads }: { status: string; leads: Lead[] }) {
  return (
    <div className="flex-shrink-0 w-72">
      <Card className={`glass border-t-4 ${STATUS_HEADER_COLORS[status] || 'border-t-primary'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            {status}
            <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-280px)] overflow-y-auto">
          <SortableContext items={leads.map((l) => l._id)} strategy={verticalListSortingStrategy}>
            {leads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchKanban = useCallback(async () => {
    const res = await api.leads.getKanban();
    setPipeline(res.data);
  }, []);

  useEffect(() => {
    fetchKanban().finally(() => setLoading(false));

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join:kanban');
    socket.on('lead:statusChanged', () => fetchKanban());
    socket.on('lead:created', () => fetchKanban());
    socket.on('lead:updated', () => fetchKanban());

    return () => { socket.disconnect(); };
  }, [fetchKanban]);

  const findLeadColumn = (leadId: string) => {
    for (const [status, leads] of Object.entries(pipeline)) {
      if (leads.find((l) => l._id === leadId)) return status;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    for (const leads of Object.values(pipeline)) {
      const lead = leads.find((l) => l._id === active.id);
      if (lead) { setActiveLead(lead); break; }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const sourceColumn = findLeadColumn(leadId);
    let targetColumn = over.id as string;

    if (!PIPELINE_STATUSES.includes(targetColumn)) {
      targetColumn = findLeadColumn(over.id as string) || sourceColumn || '';
    }

    if (sourceColumn && targetColumn && sourceColumn !== targetColumn) {
      setPipeline((prev) => {
        const updated = { ...prev };
        const lead = updated[sourceColumn]?.find((l) => l._id === leadId);
        if (!lead) return prev;
        updated[sourceColumn] = updated[sourceColumn].filter((l) => l._id !== leadId);
        updated[targetColumn] = [...(updated[targetColumn] || []), { ...lead, status: targetColumn }];
        return updated;
      });

      try {
        await api.leads.updateStatus(leadId, targetColumn);
      } catch {
        fetchKanban();
      }
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Sales Pipeline" description="Drag and drop leads through your pipeline">
        {loading ? <PageLoader /> : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {PIPELINE_STATUSES.map((status, i) => (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  id={status}
                >
                  <SortableContext id={status} items={(pipeline[status] || []).map((l) => l._id)} strategy={verticalListSortingStrategy}>
                    <KanbanColumn status={status} leads={pipeline[status] || []} />
                  </SortableContext>
                </motion.div>
              ))}
            </div>
            <DragOverlay>
              {activeLead && (
                <Card className="w-72 shadow-xl rotate-3">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm">{activeLead.companyName}</h4>
                    <p className="text-xs text-muted-foreground">{activeLead.contactPerson}</p>
                  </CardContent>
                </Card>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
