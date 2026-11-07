"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RoomCreateForm } from "@/components/room/room-form";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/hooks/useMe";
import { useActiveProperty } from "@/lib/property/active";
import { useProperties } from "@/lib/property/hooks";
import { type PropertyOption, resolveSelection } from "@/lib/property/selection";

// Kamar baru selalu masuk ke satu properti. Owner dan pengelola memilihnya dari navbar.
export function RoomCreateView() {
  const me = useMe();
  const properties = useProperties();
  const active = useActiveProperty();

  if (!me.data || !properties.data) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Memuat…
      </p>
    );
  }

  const options: PropertyOption[] = properties.data.map((p) => ({
    id: p.id,
    name: p.name,
    electricityManaged: p.electricityManaged,
    hasFacilities: p.hasFacilities,
  }));
  const selection = resolveSelection(active, options, me.data.role === "OWNER");

  if (selection.kind !== "one") {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Tambah kamar" />
        <EmptyState
          title="Pilih satu properti dulu"
          description="Kamar ditambahkan ke satu properti. Pilih properti di navbar, lalu tambah kamar."
          action={
            <Button variant="outline" asChild>
              <Link href="/kamar">Kembali ke daftar</Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Tambah kamar" description={selection.property.name} />
      <RoomCreateForm propertyId={selection.property.id} />
    </section>
  );
}
