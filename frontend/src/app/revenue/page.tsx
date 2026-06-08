'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { StatCard, PageLoader } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Revenue, Client } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RevenuePage() {
  const [records, setRecords] = useState<Revenue[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [summary, setSummary] = useState<{ _id: string; total: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ client: '', amount: 0, type: 'One Time', paymentDate: new Date().toISOString().split('T')[0], description: '' });

  const fetchData = async () => {
    const [revRes, clientRes, summaryRes] = await Promise.all([
      api.revenue.getAll(),
      api.clients.getAll(),
      api.revenue.summary(),
    ]);
    setRecords(revRes.data);
    setClients(clientRes.data);
    setSummary(summaryRes.data);
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await api.revenue.create(form);
    setDialogOpen(false);
    fetchData();
  };

  const totalRevenue = summary.reduce((acc, s) => acc + s.total, 0);
  const retainerTotal = summary.find((s) => s._id === 'Monthly Retainer')?.total || 0;
  const oneTimeTotal = summary.find((s) => s._id === 'One Time')?.total || 0;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Revenue Tracking" description="Monitor income and payment history">
        <div className="space-y-6">
          <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" /> Record Payment</Button>

          {loading ? <PageLoader /> : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Revenue" value={totalRevenue} icon={DollarSign} delay={0} />
                <StatCard title="Monthly Retainers" value={retainerTotal} icon={TrendingUp} color="text-emerald-500" delay={1} />
                <StatCard title="One-Time Payments" value={oneTimeTotal} icon={DollarSign} color="text-amber-500" delay={2} />
              </div>

              <Card className="glass">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record, i) => (
                          <motion.tr key={record._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 hover:bg-muted/30">
                            <td className="p-4 text-sm font-medium">{record.client?.companyName || 'Unknown'}</td>
                            <td className="p-4 text-sm font-semibold text-emerald-500">{formatCurrency(record.amount)}</td>
                            <td className="p-4"><Badge variant="outline">{record.type}</Badge></td>
                            <td className="p-4 text-sm text-muted-foreground">{formatDate(record.paymentDate)}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={form.client} onValueChange={(v) => setForm({ ...form, client: v })}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c._id} value={c._id}>{c.companyName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One Time">One Time</SelectItem>
                      <SelectItem value="Monthly Retainer">Monthly Retainer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Record Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
