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

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto mx-4 mb-4 flex w-full max-w-[398px] items-center justify-between rounded-[20px] border border-white/10 bg-[#161718]/95 px-2 py-2 backdrop-blur-md shadow-2xl">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-xs font-medium transition-colors",
                active ? "bg-[#FA2BA9] text-[#090A0B]" : "text-white/70 hover:text-white"
              )}
            >
              <span className="text-xl leading-none">{tab.emoji}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
