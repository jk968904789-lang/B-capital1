import { useEffect, useState, type ReactNode } from 'react';
import { Loader2, X, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="animate-slide-right">
        <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action && <div className="animate-fade-in">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
