"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RoomCreateForm } from "@/components/room/room-form";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/hooks/useMe";
import { parsePropertyParam } from "@/lib/property/filter";
import { useProperties } from "@/lib/property/hooks";

// Form tambah kamar. Properti selalu ditanyakan di form (design.md 6.22). `?properti=ID` hanya nilai awal.
export function RoomCreateView() {
  const me = useMe();
  const properties = useProperties();
  const searchParams = useSearchParams();

  if (!me.data || !properties.data) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Memuat…
      </p>
    );
  }

  const options = properties.data.map((p) => ({ id: p.id, name: p.name }));

  if (options.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Tambah kamar" />
        <EmptyState
          title="Belum ada properti"
          description={
            me.data.role === "OWNER"
              ? "Tambahkan properti dulu di menu Properti."
              : "Belum ada properti yang ditugaskan kepada Anda. Hubungi owner."
          }
          action={
            <Button variant="outline" asChild>
              <Link href="/kamar">Kembali ke daftar</Link>
            </Button>
          }
        />
      </section>
    );
  }

  const only = options.length === 1 ? options[0] : undefined;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Tambah kamar"
        description={
          only ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 aria-hidden className="size-4" />
              {only.name}
            </span>
          ) : undefined
        }
      />
      <RoomCreateForm
        properties={options}
        initialPropertyId={parsePropertyParam(searchParams.get("properti"))}
      />
    </section>
  );
}
