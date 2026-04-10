import { SubTabs } from "@/components/ui/sub-tabs";
import { PageHeader } from "@/components/ui/section-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-6">
      <PageHeader accent="Módulo" title="Administración" subtitle="Crew · Inventario · Reportes" />
      <div className="px-4">
        <SubTabs
          tabs={[
            { href: "/admin/crew", label: "Crew", emoji: "👥" },
            { href: "/admin/inventario", label: "Inventario", emoji: "📦" },
            { href: "/admin/reportes", label: "Reportes", emoji: "📊" },
          ]}
        />
      </div>
      {children}
    </div>
  );
}
