'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { PageLoader, EmptyState } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, Task, User } from '@/lib/api';
import { PRIORITY_COLORS, TASK_STATUS_COLORS, formatDate, getInitials } from '@/lib/utils';

const emptyTask = { title: '', description: '', assignedTo: '', dueDate: '', status: 'Todo', priority: 'Medium' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyTask);

  const fetchTasks = async () => {
    const res = await api.tasks.getAll();
    setTasks(res.data);
  };

  useEffect(() => {
    Promise.all([fetchTasks(), api.auth.getUsers().then((r) => setUsers(r.data))])
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await api.tasks.create(form);
    setDialogOpen(false);
    setForm(emptyTask);
    fetchTasks();
  };

  const toggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Done' ? 'Todo' : task.status === 'Todo' ? 'In Progress' : task.status === 'In Progress' ? 'Review' : 'Done';
    await api.tasks.update(task._id, { status: nextStatus });
    fetchTasks();
  };

  const grouped = {
    Todo: tasks.filter((t) => t.status === 'Todo'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    Review: tasks.filter((t) => t.status === 'Review'),
    Done: tasks.filter((t) => t.status === 'Done'),
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={() => toggleStatus(task)} className="mt-0.5">
            {task.status === 'Done' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
          </button>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h4>
            {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
              <Badge className={TASK_STATUS_COLORS[task.status]}>{task.status}</Badge>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />{formatDate(task.dueDate)}
                </span>
              )}
              {task.assignedTo && (
                <Avatar className="h-5 w-5 ml-auto">
                  <AvatarFallback className="text-[8px] bg-primary/20 text-primary">{getInitials(task.assignedTo.name)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Task Management" description="Track team tasks and deadlines">
        <div className="space-y-6">
          <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" /> Add Task</Button>

          {loading ? <PageLoader /> : tasks.length === 0 ? (
            <EmptyState title="No tasks" description="Create tasks to track your team's work" />
          ) : (
            <>
              <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                {Object.entries(grouped).map(([status, items], i) => (
                  <motion.div key={status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      {status} <Badge variant="secondary">{items.length}</Badge>
                    </h3>
                    {items.map((task) => <TaskItem key={task._id} task={task} />)}
                  </motion.div>
                ))}
              </div>
              <div className="lg:hidden">
                <Tabs defaultValue="Todo">
                  <TabsList className="w-full">
                    {Object.keys(grouped).map((s) => <TabsTrigger key={s} value={s} className="flex-1">{s}</TabsTrigger>)}
                  </TabsList>
                  {Object.entries(grouped).map(([status, items]) => (
                    <TabsContent key={status} value={status}>
                      {items.map((task) => <TaskItem key={task._id} task={task} />)}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>{users.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Low', 'Medium', 'High', 'Urgent'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
