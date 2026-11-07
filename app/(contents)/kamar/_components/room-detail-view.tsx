"use client";

import { Building2, EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSection } from "@/components/shared/settings-section";
import { StatStrip } from "@/components/shared/stat-strip";
import { StatusBadge } from "@/components/shared/status-badge";
import { RemoveRoomDialog } from "@/components/room/remove-room-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { codeFromError, errorMessage } from "@/lib/errors";
import { formatRupiah } from "@/lib/format";
import { ROOM_STATUS_LABELS } from "@/lib/labels";
import { useProperties } from "@/lib/property/hooks";
import { useRoom } from "@/lib/room/hooks";

// Halaman detail kamar (design.md 6.21). Baca saja: ubah lewat /ubah, hapus lewat menu ⋯.
// Bagian penyewa, meteran, asset, dan tiket ditambahkan saat milestone masing-masing.
export function RoomDetailView({ roomId }: { roomId: number }) {
  const room = useRoom(roomId);
  const properties = useProperties({ includeInactive: true });
  const [removeOpen, setRemoveOpen] = useState(false);

  if (room.isPending) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Memuat…
      </p>
    );
  }

  if (room.isError) {
    if (codeFromError(room.error) === "ROOM_NOT_FOUND") {
      return (
        <section className="flex flex-col gap-6">
          <PageHeader
            title="Kamar tidak ditemukan"
            actions={
              <Button variant="outline" asChild>
                <Link href="/kamar">Kembali ke daftar</Link>
              </Button>
            }
          />
        </section>
      );
    }
    return (
      <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
        {errorMessage(codeFromError(room.error))}
      </p>
    );
  }

  const data = room.data;
  const propertyName = properties.data?.find((p) => p.id === data.propertyId)?.name;
  const status = ROOM_STATUS_LABELS[data.status];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={`Kamar ${data.code}`}
        description={
          propertyName ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 aria-hidden className="size-4" />
              {propertyName}
            </span>
          ) : undefined
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/kamar/${data.id}/ubah`}>Ubah data</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Aksi kamar" className="!size-11 md:!size-10">
                  <EllipsisVertical aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="!text-danger" onSelect={() => setRemoveOpen(true)}>
                  Hapus kamar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <StatStrip
        items={[
          {
            label: "Harga sewa per bulan",
            value: formatRupiah(data.baseRentAmount),
            hint: "Harga dasar kamar",
          },
          {
            label: "Status",
            value: <StatusBadge label={status.label} tone={status.tone} />,
            hint: data.status === "OCCUPIED" ? "Diatur otomatis" : "Diatur di form ubah",
          },
        ]}
      />

      <SettingsSection title="Data kamar" description="Diisi di form ubah.">
        <dl className="divide-y divide-border">
          <DetailRow
            label="Properti"
            value={
              propertyName ? (
                <Link
                  href={`/kamar?properti=${data.propertyId}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {propertyName}
                </Link>
              ) : null
            }
          />
          <DetailRow label="Tipe kamar" value={data.roomType} />
          <DetailRow label="Fasilitas kamar" value={data.facilities} />
          <DetailRow label="Catatan" value={data.notes} />
        </dl>
      </SettingsSection>

      <RemoveRoomDialog roomId={data.id} code={data.code} open={removeOpen} onOpenChange={setRemoveOpen} />
    </section>
  );
}

// Satu baris label-nilai (design.md 6.18). Di HP label di atas nilai. Nilai kosong ditulis "–" (6.13).
function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-line text-sm font-medium">{value || "–"}</dd>
    </div>
  );
}
