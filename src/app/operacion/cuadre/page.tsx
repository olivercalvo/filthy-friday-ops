"use client";

import { useState } from "react";
import { mockEvent } from "@/lib/mock-data";

export default function CuadrePage() {
  const [state, setState] = useState({
    ticketsSold: mockEvent.tickets_sold,
    checkedIn: mockEvent.checked_in,
    vipTotal: mockEvent.vip_total,
    vipCash: mockEvent.vip_cash,
    vipCard: mockEvent.vip_card,
    vipBottles: mockEvent.vip_bottles,
    merchUnits: mockEvent.merch_units,
    merchTotal: mockEvent.merch_total,
  });

  const noShow = Math.max(0, state.ticketsSold - state.checkedIn);
  const checkInPct = state.ticketsSold > 0 ? (state.checkedIn / state.ticketsSold) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Reconciliación de tickets */}
      <section className="px-4">
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

      {/* VIP */}
      <section className="px-4">
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

      {/* Merch */}
      <section className="px-4">
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

      <div className="px-4">
        <button className="w-full rounded-2xl bg-[#FA2BA9] px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#090A0B]">
          Guardar cuadre
        </button>
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
