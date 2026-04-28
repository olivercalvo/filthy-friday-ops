import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  accent,
  right,
  className,
  loading = false,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  right?: React.ReactNode;
  className?: string;
  loading?: boolean;
}) {
  return (
    <header className={cn("flex items-start justify-between gap-3 px-4 pt-6 pb-4", className)}>
      <div className="min-w-0">
        {accent && <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{accent}</p>}
        {loading ? (
          <div
            aria-hidden
            className="mt-2 h-7 w-56 animate-pulse rounded-md bg-white/10"
          />
        ) : (
          <h1 className="mt-1 truncate text-2xl font-black tracking-tight">{title}</h1>
        )}
        {subtitle && <p className="mt-1 text-sm text-dim">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between px-4">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{children}</h2>
      {right}
    </div>
  );
}
