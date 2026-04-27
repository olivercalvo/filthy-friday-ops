import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileShell } from "@/components/layout/mobile-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { OfflinePill } from "@/components/layout/offline-pill";

export const metadata: Metadata = {
  title: "Filthy Friday OPS",
  description: "Operaciones para la fiesta más salvaje de Bocas del Toro",
};

export const viewport: Viewport = {
  themeColor: "#090A0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        <SideNav />
        <MobileShell>{children}</MobileShell>
        <BottomNav />
        <OfflinePill />
      </body>
    </html>
  );
}
