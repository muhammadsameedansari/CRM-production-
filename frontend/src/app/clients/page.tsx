'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, DollarSign } from 'lucide-react';
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
import { api, Client } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const emptyClient = { companyName: '', contactPerson: '', email: '', phone: '', services: [] as string[], monthlyRetainer: 0, notes: '', status: 'Active' };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [search, setSearch] = useState('');

  const fetchClients = async () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    const res = await api.clients.getAll(params);
    setClients(res.data);
  };

  useEffect(() => {
    fetchClients().finally(() => setLoading(false));
  }, [search]);

  const handleSave = async () => {
    await api.clients.create(form);
    setDialogOpen(false);
    setForm(emptyClient);
    fetchClients();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Client Management" description="Manage your active clients and projects">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
            <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-xs" />
          </div>

          {loading ? <PageLoader /> : clients.length === 0 ? (
            <EmptyState title="No clients yet" description="Convert won leads to clients or add manually" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {clients.map((client, i) => (
                <motion.div key={client._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{client.companyName}</h3>
                            <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
                          </div>
                        </div>
                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>{client.status}</Badge>
                      </div>
                      {client.services && client.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {client.services.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium">{formatCurrency(client.monthlyRetainer || 0)}</span>
                          <span className="text-muted-foreground">/mo</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{client.projects?.length || 0} projects</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Company Name</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Monthly Retainer ($)</Label><Input type="number" value={form.monthlyRetainer} onChange={(e) => setForm({ ...form, monthlyRetainer: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Create Client</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
