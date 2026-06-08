'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, CheckSquare, Kanban,
  DollarSign, BarChart3, Bell, FileText, Activity, Search,
  LogOut, Moon, Sun, Menu, X, Bot, Sparkles,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/team', label: 'Team', icon: BarChart3 },
  { href: '/files', label: 'Files', icon: FileText },
  { href: '/activities', label: 'Activity', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.notifications.getAll().then((res) => setUnreadCount(res.unreadCount)).catch(() => {});
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border/50 px-4 md:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs md:text-sm font-bold gradient-text truncate">AI Agency CRM</h1>
          <p className="text-[8px] md:text-[10px] text-muted-foreground truncate">Automation Hub</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-4 space-y-3">
        <Link
          href="/notifications"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user ? getInitials(user.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 glass transform transition-transform lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebar}
      </aside>
    </>
  );
}

export function Header({ title, description }: { title: string; description?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ 
    leads: Array<{ _id: string; companyName: string }>; 
    clients: Array<{ _id: string; companyName: string }>; 
    tasks: unknown[] 
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults(null); return; }
    try {
      const res = await api.dashboard.search(q);
      setSearchResults(res.data);
      setShowResults(true);
    } catch { /* ignore */ }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:pl-72">
        <div className="ml-12 lg:ml-0">
          <h2 className="text-lg md:text-xl font-bold">{title}</h2>
          {description && <p className="hidden sm:block text-xs md:text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="h-10 w-56 lg:w-72 rounded-lg border border-input bg-muted/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {showResults && searchResults && (
            <div className="absolute right-0 top-12 w-96 rounded-lg border bg-popover p-4 shadow-xl">
              {searchResults.leads.length === 0 && searchResults.clients.length === 0 && searchResults.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No results found</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {searchResults.leads.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Leads</p>
                      {searchResults.leads.map((l: { _id: string; companyName: string }) => (
                        <Link key={l._id} href={`/leads/${l._id}`} className="block py-1 text-sm hover:text-primary">{l.companyName}</Link>
                      ))}
                    </div>
                  )}
                  {searchResults.clients.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Clients</p>
                      {searchResults.clients.map((c: { _id: string; companyName: string }) => (
                        <Link key={c._id} href={`/clients/${c._id}`} className="block py-1 text-sm hover:text-primary">{c.companyName}</Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary hidden sm:block" />
          <span className="text-xs text-muted-foreground hidden sm:block">AI Powered</span>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} description={description} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
