"use client";

import { Building2, ChevronRight, KeyRound, UserPlus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatStrip, type StatItem } from "@/components/shared/stat-strip";
import { formatDayLong, greetingWIB } from "@/lib/format";
import { useMe } from "@/lib/hooks/useMe";
import { ROLE_LABELS } from "@/lib/labels";
import { useProperties } from "@/lib/property/hooks";
import { useUsers } from "@/lib/user/hooks";

type Shortcut = { href: string; label: string; note: string; icon: LucideIcon };

// Beranda M0: hanya data yang sudah ada di sistem (design.md 7.1, Beranda M0).
// Ringkasan tagihan, kamar, dan grafik menyusul di M7 (PRD 7.12).
export function DashboardView() {
  const me = useMe();
  const isOwner = me.data?.role === "OWNER";
  const properties = useProperties();
  const users = useUsers({ enabled: isOwner });

  if (!me.data) return null;

  const firstName = me.data.name.split(/\s+/)[0];
  const propertyCount = properties.data?.length;
  const managers = (users.data ?? []).filter((u) => u.role === "MANAGER");
  const activeManagers = managers.filter((u) => u.isActive).length;

  const stats: StatItem[] = [
    {
      label: "Properti",
      value: propertyCount === undefined ? "–" : propertyCount,
      hint: isOwner ? "Semua properti organisasi" : "Yang ditugaskan kepada Anda",
      href: "/properti",
    },
    isOwner
      ? {
          label: "Pengelola",
          value: users.data ? managers.length : "–",
          hint: users.data ? `${activeManagers} aktif` : "Memuat…",
          href: "/pengguna",
        }
      : { label: "Peran", value: ROLE_LABELS[me.data.role], hint: "Akses sesuai properti" },
  ];

  const shortcuts: Shortcut[] = isOwner
    ? [
        { href: "/properti", label: "Tambah properti", note: "Daftarkan bangunan kost baru", icon: Building2 },
        { href: "/pengguna", label: "Tambah pengelola", note: "Buat akun dan atur aksesnya per properti", icon: UserPlus },
        { href: "/akun", label: "Ganti kata sandi", note: "Perbarui kata sandi akun Anda", icon: KeyRound },
      ]
    : [
        { href: "/properti", label: "Lihat properti", note: "Properti yang ditugaskan kepada Anda", icon: Building2 },
        { href: "/akun", label: "Ganti kata sandi", note: "Perbarui kata sandi akun Anda", icon: KeyRound },
      ];

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader
        title={`${greetingWIB()}, ${firstName}`}
        description={`${me.data.organizationName} · ${formatDayLong()}`}
      />

      <StatStrip items={stats} />

      <section aria-labelledby="shortcut-title" className="flex flex-col gap-3">
        <h2 id="shortcut-title" className="text-base font-semibold">
          Mulai dari sini
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="text-sm text-muted-foreground">{s.note}</span>
                    </span>
                    <ChevronRight
                      aria-hidden
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
