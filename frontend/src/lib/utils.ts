import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export const LEAD_STATUSES = [
  'New', 'Contacted', 'Interested', 'Meeting Scheduled',
  'Proposal Sent', 'Negotiation', 'Won', 'Lost',
] as const;

export const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Contacted: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  Interested: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Meeting Scheduled': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Proposal Sent': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Negotiation: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Won: 'bg-green-500/10 text-green-500 border-green-500/20',
  Lost: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-slate-500/10 text-slate-500',
  Medium: 'bg-blue-500/10 text-blue-500',
  High: 'bg-orange-500/10 text-orange-500',
  Urgent: 'bg-red-500/10 text-red-500',
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  Todo: 'bg-slate-500/10 text-slate-500',
  'In Progress': 'bg-blue-500/10 text-blue-500',
  Review: 'bg-purple-500/10 text-purple-500',
  Done: 'bg-green-500/10 text-green-500',
};
