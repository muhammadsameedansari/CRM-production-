const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  auth = {
    login: (email: string, password: string) =>
      this.request<{ success: boolean; data: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string, role?: string) =>
      this.request<{ success: boolean; data: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, ...(role && { role }) }),
      }),
    getMe: () => this.request<{ success: boolean; data: User }>('/auth/me'),
    getUsers: () => this.request<{ success: boolean; data: User[] }>('/auth/users'),
  };

  dashboard = {
    get: () => this.request<{ success: boolean; data: DashboardData }>('/dashboard'),
    team: () => this.request<{ success: boolean; data: User[] }>('/dashboard/team'),
    search: (q: string) => this.request<{ success: boolean; data: SearchResults }>(`/dashboard/search?q=${encodeURIComponent(q)}`),
    activities: (page = 1) => this.request<{ success: boolean; data: Activity[] }>(`/dashboard/activities?page=${page}`),
  };

  leads = {
    getAll: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request<{ success: boolean; data: Lead[]; pagination: Pagination }>(`/leads${query}`);
    },
    getKanban: () => this.request<{ success: boolean; data: Record<string, Lead[]> }>('/leads/kanban'),
    get: (id: string) => this.request<{ success: boolean; data: Lead }>(`/leads/${id}`),
    create: (data: Partial<Lead>) => this.request<{ success: boolean; data: Lead }>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Lead>) => this.request<{ success: boolean; data: Lead }>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) => this.request<{ success: boolean; data: Lead }>(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id: string) => this.request<{ success: boolean }>(`/leads/${id}`, { method: 'DELETE' }),
    import: (leads: Partial<Lead>[]) => this.request<{ success: boolean; count: number }>('/leads/import', { method: 'POST', body: JSON.stringify({ leads }) }),
    export: () => this.request<{ success: boolean; data: Lead[] }>('/leads/export'),
    scrape: (data: { industry?: string; country?: string; count?: number }) =>
      this.request<{ success: boolean; count: number }>('/leads/scrape', { method: 'POST', body: JSON.stringify(data) }),
    sendEmail: (id: string, template: string) =>
      this.request<{ success: boolean }>(`/leads/${id}/email`, { method: 'POST', body: JSON.stringify({ template }) }),
    sendWhatsApp: (id: string, template: string) =>
      this.request<{ success: boolean }>(`/leads/${id}/whatsapp`, { method: 'POST', body: JSON.stringify({ template }) }),
  };

  clients = {
    getAll: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request<{ success: boolean; data: Client[]; pagination: Pagination }>(`/clients${query}`);
    },
    get: (id: string) => this.request<{ success: boolean; data: Client }>(`/clients/${id}`),
    create: (data: Partial<Client>) => this.request<{ success: boolean; data: Client }>('/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Client>) => this.request<{ success: boolean; data: Client }>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<{ success: boolean }>(`/clients/${id}`, { method: 'DELETE' }),
    export: () => this.request<{ success: boolean; data: Client[] }>('/clients/export'),
  };

  tasks = {
    getAll: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request<{ success: boolean; data: Task[]; pagination: Pagination }>(`/tasks${query}`);
    },
    create: (data: Partial<Task>) => this.request<{ success: boolean; data: Task }>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Task>) => this.request<{ success: boolean; data: Task }>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
  };

  revenue = {
    getAll: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request<{ success: boolean; data: Revenue[] }>(`/revenue${query}`);
    },
    create: (data: Partial<Revenue>) => this.request<{ success: boolean; data: Revenue }>('/revenue', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Revenue>) => this.request<{ success: boolean; data: Revenue }>(`/revenue/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<{ success: boolean }>(`/revenue/${id}`, { method: 'DELETE' }),
    summary: () => this.request<{ success: boolean; data: { _id: string; total: number; count: number }[] }>('/revenue/summary'),
  };

  notifications = {
    getAll: () => this.request<{ success: boolean; data: Notification[]; unreadCount: number }>('/notifications'),
    markAsRead: (id: string) => this.request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => this.request<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),
  };

  files = {
    getAll: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request<{ success: boolean; data: CRMFile[] }>(`/files${query}`);
    },
    upload: async (file: File, metadata: Record<string, string>) => {
      const token = this.getToken();
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(metadata).forEach(([k, v]) => formData.append(k, v));
      const res = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    delete: (id: string) => this.request<{ success: boolean }>(`/files/${id}`, { method: 'DELETE' }),
  };
}

export const api = new ApiClient();

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  stats?: {
    leadsAdded: number;
    meetingsBooked: number;
    dealsClosed: number;
    revenueGenerated: number;
    tasksCompleted: number;
  };
}

export interface Lead {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  website?: string;
  country?: string;
  industry?: string;
  source?: string;
  assignedTo?: User;
  status: string;
  notes?: string;
  aiScore?: number;
  meetingDate?: string;
  followUpDate?: string;
  estimatedValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  companyName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  services?: string[];
  monthlyRetainer?: number;
  payments?: { amount: number; date: string; type: string; status: string }[];
  projects?: { name: string; status: string; description?: string }[];
  notes?: string;
  status?: string;
  assignedTo?: User;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  assignedTo: User;
  dueDate?: string;
  status: string;
  priority: string;
  relatedLead?: Lead;
  relatedClient?: Client;
}

export interface Revenue {
  _id: string;
  client: Client;
  amount: number;
  type: string;
  paymentDate: string;
  description?: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Activity {
  _id: string;
  user: User;
  action: string;
  entityType: string;
  timestamp: string;
}

export interface CRMFile {
  _id: string;
  originalName: string;
  url: string;
  category: string;
  mimeType: string;
  size: number;
  uploadedBy: User;
  createdAt: string;
}

export interface DashboardData {
  stats: {
    totalLeads: number;
    activeLeads: number;
    meetingsScheduled: number;
    closedDeals: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
  leadsByStatus: { _id: string; count: number }[];
  monthlyRevenueChart: { _id: { month: number; year: number }; total: number }[];
  recentActivities: Activity[];
}

export interface SearchResults {
  leads: Lead[];
  clients: Client[];
  tasks: Task[];
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
}
