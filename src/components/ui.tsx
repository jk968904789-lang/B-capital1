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
  hint,
  tone = 'default',
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: typeof Loader2;
  hint?: string;
  tone?: 'default' | 'gold' | 'dark' | 'accent';
  delay?: number;
}) {
  const toneStyles = {
    default: 'bg-gold-50 text-gold-600',
    gold: 'bg-gold-400 text-ink-950',
    dark: 'bg-ink-950 text-gold-400',
    accent: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div
      className="card-luxe-hover p-6 animate-count-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-5 font-serif text-3xl font-semibold text-ink-900">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-ink-400">{label}</p>
      {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function StatSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="card-luxe p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="skeleton h-11 w-11 rounded-xl" />
      <div className="skeleton mt-5 h-8 w-20" />
      <div className="skeleton mt-2 h-3 w-28" />
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-200" />
        <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-gold-500" />
      </div>
      <p className="mt-4 text-sm text-ink-400">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: typeof Loader2;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 py-20 text-center animate-fade-up">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-100">
        <Icon className="h-8 w-8 text-ink-300" strokeWidth={1.5} />
      </div>
      <p className="mt-5 font-serif text-xl font-medium text-ink-700">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-400">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 py-16 text-center animate-fade-up">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-400" strokeWidth={1.5} />
      </div>
      <p className="mt-5 font-serif text-xl font-medium text-red-800">{message}</p>
      <p className="mt-2 text-sm text-red-400">Please try again or contact support if the problem persists.</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-6">Try Again</button>
      )}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const maxW = size === 'xl' ? 'max-w-3xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxW} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <h3 className="font-serif text-lg font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-all hover:bg-ink-50 hover:text-ink-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'default',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'default' | 'danger';
}) {
  const [pending, setPending] = useState(false);
  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
      onClose();
    }
  };
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-4">
        {tone === 'danger' && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
        )}
        <p className="pt-1 text-sm leading-relaxed text-ink-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} disabled={pending} className="btn-outline">Cancel</button>
        <button
          onClick={handleConfirm}
          disabled={pending}
          className={tone === 'danger' ? 'btn-danger' : 'btn-gold'}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  const styles = type === 'success'
    ? 'bg-emerald-600 text-white'
    : 'bg-red-600 text-white';
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl px-5 py-4 text-sm shadow-xl animate-fade-up">
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${styles}`}>
        {type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
