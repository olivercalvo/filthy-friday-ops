"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SubTab = { href: string; label: string; emoji?: string };

export function SubTabs({ tabs }: { tabs: SubTab[] }) {
  const pathname = usePathname() ?? "";
  return (
    <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              active
                ? "border-[#FA2BA9] bg-[#FA2BA9] text-[#090A0B]"
                : "border-white/10 bg-[#161718] text-white/70 hover:text-white"
            )}
          >
            {tab.emoji && <span className="mr-1">{tab.emoji}</span>}
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
