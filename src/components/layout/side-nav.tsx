"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  emoji: string;
  match: (path: string) => boolean;
};

const tabs: Tab[] = [
  { href: "/", label: "Inicio", emoji: "⚡", match: (p) => p === "/" },
  { href: "/operacion/montaje", label: "Operación", emoji: "🎯", match: (p) => p.startsWith("/operacion") },
  { href: "/admin/crew", label: "Admin", emoji: "⚙️", match: (p) => p.startsWith("/admin") },
];

export function SideNav() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] border-r border-white/10 bg-[#0F1011] lg:flex lg:flex-col">
      <div className="px-6 pt-8 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Filthy</p>
        <p className="text-2xl font-black tracking-tight">OPS</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-[#FA2BA9] text-[#090A0B]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-lg leading-none">{tab.emoji}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 pb-6 pt-4 text-[10px] uppercase tracking-wider text-dim">
        v0.2 · prototype
      </div>
    </aside>
  );
}
