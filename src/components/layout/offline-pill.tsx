import { pingSupabase } from "@/lib/data/queries";

export async function OfflinePill() {
  const online = await pingSupabase();
  if (online) return null;
  return (
    <div className="fixed top-3 right-3 z-30 lg:top-4 lg:right-4">
      <div className="flex items-center gap-2 rounded-full border border-[#FFF200]/40 bg-[#FFF200]/10 px-3 py-1.5 backdrop-blur-md">
        <span className="inline-block h-2 w-2 rounded-full bg-[#FFF200]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFF200]">Modo offline · datos mock</span>
      </div>
    </div>
  );
}
