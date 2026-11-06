"use client";

import { useProperties } from "@/lib/property/hooks";
import { useMe } from "@/lib/hooks/useMe";
import { ROLE_LABELS } from "@/lib/labels";

// Beranda sederhana untuk M0. Ringkasan operasional menyusul di M7 (PRD 7.12).
export function DashboardView() {
  const me = useMe();
  const properties = useProperties();

  if (!me.data) return null;

  return (
    <section>
      <h1 className="text-xl font-semibold">Beranda</h1>
      <p className="mt-1 text-sm text-muted-foreground">Selamat datang, {me.data.name}.</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4">
          <dt className="text-sm text-muted-foreground">Peran</dt>
          <dd className="mt-1 text-base font-medium">{ROLE_LABELS[me.data.role]}</dd>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <dt className="text-sm text-muted-foreground">Properti</dt>
          <dd className="num mt-1 text-2xl font-semibold">{properties.data?.length ?? "–"}</dd>
        </div>
      </dl>
    </section>
  );
}
