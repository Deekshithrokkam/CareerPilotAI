import { ReactNode } from "react";

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export function ErrorAlert({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-semibold text-ink">{title}</h3><p className="mt-2 text-sm text-slate-600">{body}</p></div>;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="p-8 text-center text-sm text-slate-600">{label}...</div>;
}
