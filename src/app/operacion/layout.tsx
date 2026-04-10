import { SubTabs } from "@/components/ui/sub-tabs";
import { PageHeader } from "@/components/ui/section-header";

export default function OperacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-6">
      <PageHeader accent="Módulo" title="Operación" subtitle="Preparar · Ejecutar · Cerrar" />
      <div className="px-4">
        <SubTabs
          tabs={[
            { href: "/operacion/montaje", label: "Montaje", emoji: "🛠️" },
            { href: "/operacion/en-vivo", label: "En Vivo", emoji: "📡" },
            { href: "/operacion/cuadre", label: "Cuadre", emoji: "💰" },
          ]}
        />
      </div>
      {children}
    </div>
  );
}
