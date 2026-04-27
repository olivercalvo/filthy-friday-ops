import { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-near-black lg:pl-[220px]">
      <div className="mx-auto w-full max-w-[430px] md:max-w-[768px] lg:max-w-[1280px] lg:px-6">
        {children}
      </div>
    </div>
  );
}
