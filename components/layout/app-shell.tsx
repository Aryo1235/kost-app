"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Building2, LayoutDashboard, LogOut, Users, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { codeFromError } from "@/lib/errors";
import { useMe } from "@/lib/hooks/useMe";
import { ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; show: boolean };

// Kerangka aplikasi: sidebar di desktop (1024px ke atas), bilah bawah di HP dan tablet (design.md 5).
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

  const user = me.data;
  const items: NavItem[] = [
    { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, show: true },
    { href: "/properti", label: "Properti", icon: Building2, show: true },
    { href: "/pengguna", label: "Pengguna", icon: Users, show: user.permissions.manageUsers },
    { href: "/akun", label: "Akun", icon: UserCog, show: true },
  ];
  const visible = items.filter((item) => item.show);

  async function onLogout() {
    await logout();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[232px] flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex">
        <div className="px-2 pb-4">
          <p className="text-base font-semibold tracking-tight">Kost</p>
          <p className="mt-3 text-sm text-muted-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>
        <nav aria-label="Menu utama" className="flex flex-1 flex-col gap-1">
          {visible.map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>
        <Button variant="ghost" className="justify-start" onClick={onLogout}>
          <LogOut aria-hidden />
          Keluar
        </Button>
      </aside>

      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <p className="text-base font-semibold tracking-tight">Kost</p>
        <p className="text-sm text-muted-foreground">{user.name}</p>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-24 md:px-6 lg:py-8 lg:pl-[calc(232px+2rem)] lg:pr-8">
        {children}
      </main>

      <nav
        aria-label="Menu bawah"
        className="fixed inset-x-0 bottom-0 z-10 grid border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
        style={{ gridTemplateColumns: `repeat(${Math.min(visible.length, 4)}, minmax(0, 1fr))` }}
      >
        {visible.slice(0, 4).map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-0.5 text-xs",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon aria-hidden className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md px-2 text-sm",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-foreground hover:bg-muted",
      )}
    >
      <Icon aria-hidden className="size-4" />
      {item.label}
    </Link>
  );
}
