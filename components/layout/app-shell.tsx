"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { logout } from "@/lib/auth/actions";
import { codeFromError } from "@/lib/errors";
import { useMe } from "@/lib/hooks/useMe";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

// Kerangka area berlogin: sidebar inset + navbar + isi (shadcn dashboard-01, design.md 5.1).
// Penjaga sesi di sini hanya untuk pengalihan tampilan. Izin sebenarnya di backend.
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const me = useMe();

  useEffect(() => {
    if (me.error && codeFromError(me.error) === "UNAUTHORIZED") {
      router.replace("/login");
      return;
    }
    // Sandi sementara harus diganti dulu. Semua halaman lain ditahan di Akun (FR-AUTH-06).
    if (me.data?.mustChangePassword && pathname !== "/akun") {
      router.replace("/akun");
    }
  }, [me.error, me.data, pathname, router]);

  if (!me.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground" role="status">
          Memuat…
        </p>
      </div>
    );
  }

  async function onLogout() {
    await logout();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }

  return (
    // TooltipProvider wajib: SidebarMenuButton memakai Tooltip saat sidebar diciutkan ke ikon.
    <TooltipProvider>
    <SidebarProvider
      style={{ "--sidebar-width": "18rem", "--header-height": "3rem" } as CSSProperties}
    >
      <a
        href="#konten"
        className="sr-only z-50 rounded-md bg-card px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Lewati ke konten
      </a>
      <AppSidebar me={me.data} onLogout={onLogout} />
      <SidebarInset>
        <SiteHeader />
        <main id="konten" className="flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
