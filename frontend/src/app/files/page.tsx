'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { PageLoader, EmptyState } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, CRMFile } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function FilesPage() {
  const [files, setFiles] = useState<CRMFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    const res = await api.files.getAll(params);
    setFiles(res.data);
  };

  useEffect(() => {
    fetchFiles().finally(() => setLoading(false));
  }, [category]);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        await api.files.upload(file, { category: category || 'Other' });
        fetchFiles();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this file?')) {
      await api.files.delete(id);
      fetchFiles();
    }
  };

  const categoryColors: Record<string, string> = {
    Proposal: 'bg-blue-500/10 text-blue-500',
    Contract: 'bg-emerald-500/10 text-emerald-500',
    'Client Asset': 'bg-purple-500/10 text-purple-500',
    Other: 'bg-slate-500/10 text-slate-500',
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="File Storage" description="Proposals, contracts, and client assets">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Button onClick={handleUpload} disabled={uploading} className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <Select value={category} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {['Proposal', 'Contract', 'Client Asset', 'Other'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? <PageLoader /> : files.length === 0 ? (
            <EmptyState title="No files uploaded" description="Upload proposals, contracts, and client assets" action={<Button onClick={handleUpload}><Upload className="h-4 w-4 mr-2" /> Upload</Button>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {files.map((file, i) => (
                <motion.div key={file._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{file.originalName}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(file.createdAt)} · {(file.size / 1024).toFixed(1)} KB</p>
                          <Badge className={`mt-2 ${categoryColors[file.category] || categoryColors.Other}`}>{file.category}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer"><Download className="h-3.5 w-3.5 mr-1" /> View</a>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(file._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
