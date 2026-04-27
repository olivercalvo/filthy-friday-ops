"use client";

import { useState } from "react";
import Link from "next/link";
import { mockEvent, mockVenues, mockAlerts, mockChecklistItems } from "@/lib/mock-data";
import { StatusPill } from "@/components/ui/status-pill";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn, formatPanamaTime } from "@/lib/utils";
import type { AlertRow } from "@/types/database";

type LocalAlert = AlertRow;

function venueProgress(venueId: string) {
  const items = mockChecklistItems.filter((i) => i.venue_id === venueId);
  if (items.length === 0) return 0;
  return (items.filter((i) => i.completed).length / items.length) * 100;
}

export default function EnVivoPage() {
  const [alerts, setAlerts] = useState<LocalAlert[]>(mockAlerts);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"ok" | "warn" | "info">("ok");

  const addAlert = () => {
    if (!message.trim()) return;
    const newAlert: LocalAlert = {
      id: `a-${Date.now()}`,
      event_id: mockEvent.id,
      time: new Date().toISOString(),
      message: message.trim(),
      type,
      venue_id: null,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setMessage("");
  };

  const noShow = mockEvent.tickets_sold - mockEvent.checked_in;
  const noShowPct = Math.round((noShow / Math.max(1, mockEvent.tickets_sold)) * 100);

  return (
    <div className="space-y-5">
      <section className="px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <MetricCard label="Tickets" value={mockEvent.tickets_sold.toString()} color="text-white" />
          <MetricCard label="Check-ins" value={mockEvent.checked_in.toString()} color="text-[#9DFF60]" />
          <MetricCard label="No-show" value={`${noShowPct}%`} color="text-[#FFF200]" />
          <MetricCard label="Ventas VIP" value={`$${mockEvent.vip_total.toLocaleString()}`} color="text-[#F7DA64]" />
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Venues</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {mockVenues.map((v) => {
            const active = v.id === mockEvent.active_venue_id;
            const finished = (mockVenues.findIndex((x) => x.id === mockEvent.active_venue_id) ?? 0) >
              (mockVenues.findIndex((x) => x.id === v.id) ?? 0);
            const progress = venueProgress(v.id);
            return (
              <Link
                key={v.id}
                href={`/operacion/montaje?venue=${v.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#161718] p-3 transition-colors hover:border-[#FA2BA9]/50"
              >
                <span className="text-2xl">{v.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{v.name}</p>
                  <p className="text-[11px] text-dim">{v.start_time}–{v.end_time}</p>
                  <div className="mt-1">
                    <StatusPill variant={active ? "active" : finished ? "off" : "pending"}>
                      {active ? "Activo" : finished ? "Cerrado" : "Pendiente"}
                    </StatusPill>
                  </div>
                </div>
                <ProgressRing value={progress} size={48} stroke={4} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Nueva alerta</h2>
        <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe la alerta…"
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-[#FA2BA9]"
            onKeyDown={(e) => e.key === "Enter" && addAlert()}
          />
          <div className="mt-2 flex items-center gap-2">
            {(["ok", "warn", "info"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
                  type === t
                    ? t === "ok"
                      ? "bg-[#9DFF60] text-[#090A0B]"
                      : t === "warn"
                      ? "bg-[#FFF200] text-[#090A0B]"
                      : "bg-[#FA2BA9] text-[#090A0B]"
                    : "border border-white/10 text-white/60"
                )}
              >
                {t === "ok" ? "OK" : t === "warn" ? "Alerta" : "Info"}
              </button>
            ))}
            <button
              onClick={addAlert}
              className="rounded-lg bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#090A0B]"
            >
              Publicar
            </button>
          </div>
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Feed</h2>
        <ol className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="flex gap-3 rounded-xl border border-white/10 bg-[#161718] p-3">
              <span
                className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: a.type === "ok" ? "#9DFF60" : a.type === "warn" ? "#FFF200" : "#FA2BA9",
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{a.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-dim">
                  {formatPanamaTime(a.time)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
      <p className="text-[9px] uppercase tracking-wider text-dim">{label}</p>
      <p className={cn("mt-1 text-2xl font-black leading-none", color)}>{value}</p>
    </div>
  );
}
