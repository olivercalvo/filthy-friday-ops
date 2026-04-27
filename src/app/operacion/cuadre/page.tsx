"use client";

import { useState, useEffect } from "react";
import { mockEvent } from "@/lib/mock-data";
import { fetchWithFallback } from "@/lib/data/client-fetch";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { EventRow } from "@/types/database";
import { cn } from "@/lib/utils";

type FormState = {
  ticketsSold: number;
  checkedIn: number;
  vipTotal: number;
  vipCash: number;
  vipCard: number;
  vipBottles: number;
  merchUnits: number;
  merchTotal: number;
};

function fromEvent(e: EventRow): FormState {
  return {
    ticketsSold: e.tickets_sold,
    checkedIn: e.checked_in,
    vipTotal: e.vip_total,
    vipCash: e.vip_cash,
    vipCard: e.vip_card,
    vipBottles: e.vip_bottles,
    merchUnits: e.merch_units,
    merchTotal: e.merch_total,
  };
}

export default function CuadrePage() {
  const [eventId, setEventId] = useState<string>(mockEvent.id);
  const [state, setState] = useState<FormState>(fromEvent(mockEvent));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const eventRes = await fetchWithFallback<EventRow>(
        "event",
        async (c) => {
          const { data, error } = await c
            .from("events")
            .select("*")
            .eq("status", "active")
            .order("date", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          if (!data) throw new Error("no active event");
          return data as EventRow;
        },
        mockEvent
      );
      if (canceled) return;
      setEventId(eventRes.data.id);
      setState(fromEvent(eventRes.data));
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const noShow = Math.max(0, state.ticketsSold - state.checkedIn);
  const checkInPct = state.ticketsSold > 0 ? (state.checkedIn / state.ticketsSold) * 100 : 0;

  const save = async () => {
    if (!isSupabaseConfigured()) {
      setSavedAt(new Date());
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .update({
          tickets_sold: state.ticketsSold,
          checked_in: state.checkedIn,
          vip_total: state.vipTotal,
          vip_cash: state.vipCash,
          vip_card: state.vipCard,
          vip_bottles: state.vipBottles,
          merch_units: state.merchUnits,
          merch_total: state.merchTotal,
        })
        .eq("id", eventId);
      if (error) throw error;
      setSavedAt(new Date());
    } catch (err) {
      console.warn("[cuadre:save] failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
        <section>
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Reconciliación de tickets</h2>
          <div className="rounded-2xl border border-white/10 bg-[#161718] p-4">
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <Stat label="Vendidos" value={state.ticketsSold.toString()} color="text-white" />
              <Stat label="Check-in" value={state.checkedIn.toString()} color="text-[#9DFF60]" />
              <Stat label="No-show" value={noShow.toString()} color="text-[#FFF200]" />
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="absolute left-0 top-0 h-full bg-[#9DFF60]"
                style={{ width: `${checkInPct}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-dim">
              {checkInPct.toFixed(1)}% check-in rate
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <EditField label="Vendidos" value={state.ticketsSold} onChange={(v) => setState((s) => ({ ...s, ticketsSold: v }))} />
              <EditField label="Check-in" value={state.checkedIn} onChange={(v) => setState((s) => ({ ...s, checkedIn: v }))} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Cuadre VIP</h2>
          <div className="rounded-2xl border border-white/10 bg-[#161718] p-4">
            <p className="text-[10px] uppercase tracking-wider text-dim">Total</p>
            <p className="text-3xl font-black text-[#F7DA64]">${state.vipTotal.toLocaleString()}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <EditField label="Total VIP" value={state.vipTotal} onChange={(v) => setState((s) => ({ ...s, vipTotal: v }))} prefix="$" />
              <EditField label="Botellas" value={state.vipBottles} onChange={(v) => setState((s) => ({ ...s, vipBottles: v }))} />
              <EditField label="Efectivo" value={state.vipCash} onChange={(v) => setState((s) => ({ ...s, vipCash: v }))} prefix="$" />
              <EditField label="Tarjeta" value={state.vipCard} onChange={(v) => setState((s) => ({ ...s, vipCard: v }))} prefix="$" />
            </div>
          </div>
        </section>

        <section className="md:col-span-2 lg:col-span-1">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Merchandise</h2>
          <div className="rounded-2xl border border-white/10 bg-[#161718] p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-dim">Unidades</p>
                <p className="text-2xl font-black">{state.merchUnits}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-dim">Total</p>
                <p className="text-2xl font-black text-[#F7DA64]">${state.merchTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <EditField label="Unidades" value={state.merchUnits} onChange={(v) => setState((s) => ({ ...s, merchUnits: v }))} />
              <EditField label="Total" value={state.merchTotal} onChange={(v) => setState((s) => ({ ...s, merchTotal: v }))} prefix="$" />
            </div>
          </div>
        </section>
      </div>

      <div className="px-4">
        <button
          onClick={save}
          disabled={saving}
          className={cn(
            "w-full rounded-2xl bg-[#FA2BA9] px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#090A0B] md:max-w-sm",
            saving && "opacity-60"
          )}
        >
          {saving ? "Guardando…" : "Guardar cuadre"}
        </button>
        {savedAt && (
          <p className="mt-2 text-[11px] text-[#9DFF60]">
            ✓ Guardado a las {savedAt.toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit", timeZone: "America/Panama" })}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-dim">{label}</p>
      <p className={`mt-0.5 text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider text-dim">{label}</span>
      <div className="mt-1 flex items-center rounded-lg border border-white/10 bg-[#090A0B] px-2">
        {prefix && <span className="text-xs text-dim">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent px-1 py-1.5 text-sm outline-none"
        />
      </div>
    </label>
  );
}
