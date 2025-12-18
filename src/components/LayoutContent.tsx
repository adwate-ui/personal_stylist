"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import ToastProvider from "@/components/ToastProvider";

export default function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname?.startsWith("/onboarding") || pathname?.startsWith("/auth");
  
  return (
    <>
      <Navigation />
      <main className={`min-h-screen transition-all duration-300 ${isLanding ? "" : "md:pl-64"}`}>
        {children}
      </main>
      <ToastProvider />
    </>
  );
}
