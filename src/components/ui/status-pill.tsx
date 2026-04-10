import { cn } from "@/lib/utils";

type Variant = "active" | "pending" | "off" | "pink" | "gold" | "info";

const styles: Record<Variant, string> = {
  active:  "bg-[#9DFF60]/15 text-[#9DFF60] border border-[#9DFF60]/30",
  pending: "bg-[#FFF200]/15 text-[#FFF200] border border-[#FFF200]/30",
  off:     "bg-white/5 text-white/40 border border-white/10",
  pink:    "bg-[#FA2BA9]/15 text-[#FA2BA9] border border-[#FA2BA9]/30",
  gold:    "bg-[#F7DA64]/15 text-[#F7DA64] border border-[#F7DA64]/30",
  info:    "bg-white/10 text-white border border-white/20",
};

export function StatusPill({
  variant = "info",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", styles[variant], className)}>
      {children}
    </span>
  );
}
