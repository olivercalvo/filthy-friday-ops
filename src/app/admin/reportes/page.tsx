import { FileText, BarChart3, Users, Package, DollarSign, History } from "lucide-react";

const reports = [
  { id: "fiesta", icon: FileText, title: "Reporte de Fiesta", desc: "Resumen consolidado post-evento", color: "#FA2BA9" },
  { id: "tickets", icon: BarChart3, title: "Reconciliación Tickets", desc: "Easymon vs QFlow vs real", color: "#9DFF60" },
  { id: "financiero", icon: DollarSign, title: "Cuadre Financiero", desc: "VIP + Merchandise + Tokens", color: "#F7DA64" },
  { id: "crew", icon: Users, title: "Asistencia de Crew", desc: "Horas, turnos, asignaciones", color: "#FFF200" },
  { id: "inventario", icon: Package, title: "Movimiento de Inventario", desc: "Consumo y devoluciones por venue", color: "#FA2BA9" },
  { id: "historico", icon: History, title: "Histórico de Fiestas", desc: "Tendencias, comparativas, KPIs", color: "#9DFF60" },
];

export default function ReportesPage() {
  return (
    <div className="grid grid-cols-1 gap-2 px-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((r) => {
        const Icon = r.icon;
        return (
          <button
            key={r.id}
            className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-[#161718] p-4 text-left transition-colors hover:border-[#FA2BA9]/50"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${r.color}18`, color: r.color }}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{r.title}</p>
              <p className="truncate text-[11px] text-dim">{r.desc}</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-dim">Próximo</span>
          </button>
        );
      })}
      <p className="px-2 pt-4 text-[11px] leading-relaxed text-dim md:col-span-2 lg:col-span-3">
        Los reportes estarán disponibles en una fase posterior. La infraestructura de datos ya está lista para generarlos.
      </p>
    </div>
  );
}
