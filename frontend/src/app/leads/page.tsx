'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Upload, Sparkles, Mail, MessageCircle, Trash2, Filter } from 'lucide-react';
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
import { api, Lead, User } from '@/lib/api';
import { STATUS_COLORS, LEAD_STATUSES, formatDate, getInitials } from '@/lib/utils';

const emptyLead = {
  companyName: '', contactPerson: '', email: '', phone: '', website: '',
  country: '', industry: '', source: 'Other', status: 'New', notes: '', estimatedValue: 0,
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Partial<Lead> | null>(null);
  const [form, setForm] = useState(emptyLead);
  const [filters, setFilters] = useState({ status: '', search: '', source: '' });

  const fetchLeads = useCallback(async () => {
    const params: Record<string, string> = {};
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.source) params.source = filters.source;
    const res = await api.leads.getAll(params);
    setLeads(res.data);
  }, [filters]);

  useEffect(() => {
    Promise.all([fetchLeads(), api.auth.getUsers().then((r) => setUsers(r.data))])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchLeads]);

  const handleSave = async () => {
    if (editingLead?._id) {
      await api.leads.update(editingLead._id, form);
    } else {
      await api.leads.create(form);
    }
    setDialogOpen(false);
    setEditingLead(null);
    setForm(emptyLead);
    fetchLeads();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this lead?')) {
      await api.leads.delete(id);
      fetchLeads();
    }
  };

  const handleExport = async () => {
    const res = await api.leads.export();
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-export.json';
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        const leadsArray = Array.isArray(data) ? data : data.leads || [data];
        await api.leads.import(leadsArray);
        fetchLeads();
      } catch { alert('Invalid file format'); }
    };
    input.click();
  };

  const handleScrape = async () => {
    const industry = prompt('Industry to scrape:');
    if (industry) {
      await api.leads.scrape({ industry, count: 5 });
      fetchLeads();
    }
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      companyName: lead.companyName, contactPerson: lead.contactPerson, email: lead.email,
      phone: lead.phone || '', website: lead.website || '', country: lead.country || '',
      industry: lead.industry || '', source: lead.source || 'Other', status: lead.status,
      notes: lead.notes || '', estimatedValue: lead.estimatedValue || 0,
    });
    setDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Lead Management" description="Track and manage your sales pipeline">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Button onClick={() => { setEditingLead(null); setForm(emptyLead); setDialogOpen(true); }} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Lead
            </Button>
            <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto"><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button variant="outline" onClick={handleImport} className="w-full sm:w-auto"><Upload className="h-4 w-4 mr-2" /> Import</Button>
            <Button variant="outline" onClick={handleScrape} className="w-full sm:w-auto"><Sparkles className="h-4 w-4 mr-2" /> Scrape Leads</Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Input placeholder="Search leads..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full sm:max-w-xs" />
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? '' : v })}>
              <SelectTrigger className="w-44"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? <PageLoader /> : leads.length === 0 ? (
            <EmptyState title="No leads found" description="Add your first lead or import from CSV" action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Lead</Button>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {leads.map((lead, i) => (
                <motion.div key={lead._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group" onClick={() => openEdit(lead)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{lead.companyName}</h3>
                          <p className="text-sm text-muted-foreground">{lead.contactPerson}</p>
                        </div>
                        <Badge className={STATUS_COLORS[lead.status]}>{lead.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{lead.email}</p>
                        {lead.industry && <p>{lead.industry} · {lead.country}</p>}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          {lead.assignedTo && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{getInitials(lead.assignedTo.name)}</AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {lead.aiScore !== undefined && (
                            <Badge variant="outline" className="text-[10px]"><Sparkles className="h-3 w-3 mr-1" />{lead.aiScore}</Badge>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); api.leads.sendEmail(lead._id, 'followUp'); }}>
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); api.leads.sendWhatsApp(lead._id, 'followUp'); }}>
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(lead._id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Company</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
                <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
                <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'WhatsApp', 'Email', 'Other'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">{editingLead ? 'Update Lead' : 'Create Lead'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
