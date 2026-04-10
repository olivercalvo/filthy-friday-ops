import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/ui/section-header";
import { StatusPill } from "@/components/ui/status-pill";
import { ProgressRing } from "@/components/ui/progress-ring";
import {
  mockEvent,
  mockVenues,
  mockChecklistItems,
  mockAlerts,
} from "@/lib/mock-data";

function formatEventDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" });
}

function venueProgress(venueId: string) {
  const items = mockChecklistItems.filter((i) => i.venue_id === venueId);
  if (items.length === 0) return 0;
  return (items.filter((i) => i.completed).length / items.length) * 100;
}

function venueStatus(venueId: string): "active" | "pending" | "off" {
  const p = venueProgress(venueId);
  if (p >= 100) return "active";
  if (p > 0) return "pending";
  return "off";
}

const alertDot: Record<string, string> = {
  ok: "#9DFF60",
  warn: "#FFF200",
  info: "#FA2BA9",
};

export default function Home() {
  const checkInPct = Math.round((mockEvent.checked_in / Math.max(1, mockEvent.tickets_sold)) * 100);
  const overallMontaje = Math.round(
    (mockChecklistItems.filter((i) => i.completed).length / mockChecklistItems.length) * 100
  );

  return (
    <div className="pb-6">
      <PageHeader
        accent="Filthy Friday OPS"
        title={formatEventDate(mockEvent.date)}
        subtitle={`Venue activo · ${mockVenues.find((v) => v.id === mockEvent.active_venue_id)?.name ?? "—"}`}
        right={
          mockEvent.status === "active" ? (
            <div className="flex items-center gap-2 rounded-full border border-[#9DFF60]/40 bg-[#9DFF60]/10 px-3 py-1.5">
              <span className="pulse-live inline-block h-2 w-2 rounded-full bg-[#9DFF60]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9DFF60]">En Vivo</span>
            </div>
          ) : null
        }
      />

      <section className="px-4">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#161718] p-3">
          <Metric label="Tickets" value={mockEvent.tickets_sold.toString()} />
          <Metric label="Check-ins" value={`${mockEvent.checked_in}`} hint={`${checkInPct}%`} color="text-[#9DFF60]" />
          <Metric label="Montaje" value={`${overallMontaje}%`} color="text-[#FA2BA9]" />
        </div>
      </section>

      <div className="mt-6">
        <SectionTitle>Venues</SectionTitle>
        <div className="space-y-3 px-4">
          {mockVenues.map((venue) => {
            const progress = venueProgress(venue.id);
            const status = venueStatus(venue.id);
            return (
              <Link
                key={venue.id}
                href={`/operacion/montaje?venue=${venue.id}`}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#161718] p-4 transition-colors hover:border-[#FA2BA9]/50"
              >
                <div className="text-3xl leading-none">{venue.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold">{venue.name}</h3>
                    <StatusPill variant={status}>
                      {status === "active" ? "Listo" : status === "pending" ? "En montaje" : "Pendiente"}
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-xs text-dim">
                    {venue.start_time}–{venue.end_time} · {venue.location}
                  </p>
                </div>
                <ProgressRing value={progress} size={56} stroke={5} />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle>Feed en vivo</SectionTitle>
        <ol className="space-y-2 px-4">
          {mockAlerts.slice(0, 5).map((a) => (
            <li key={a.id} className="flex gap-3 rounded-xl border border-white/10 bg-[#161718] p-3">
              <span
                className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: alertDot[a.type] }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{a.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-dim">
                  {new Date(a.time).toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Metric({ label, value, hint, color = "text-white" }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[9px] uppercase tracking-wider text-dim">{label}</span>
      <span className={`mt-0.5 text-xl font-black leading-tight ${color}`}>{value}</span>
      {hint && <span className="text-[10px] text-dim">{hint}</span>}
    </div>
  );
}
