"use client";

import { PageHeader } from "@/components/shared/page-header";
import { RoomEditForm } from "@/components/room/room-form";
import { codeFromError, errorMessage } from "@/lib/errors";
import { useProperties } from "@/lib/property/hooks";
import { useRoom } from "@/lib/room/hooks";

// Detail dan ubah kamar. Nama properti diambil dari daftar yang sama dengan pemilih navbar.
export function RoomEditView({ roomId }: { roomId: number }) {
  const room = useRoom(roomId);
  const properties = useProperties({ includeInactive: true });

  if (room.isPending) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Memuat…
      </p>
    );
  }

  if (room.isError) {
    return (
      <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
        {errorMessage(codeFromError(room.error))}
      </p>
    );
  }

  const propertyName = properties.data?.find((p) => p.id === room.data.propertyId)?.name;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={`Kamar ${room.data.code}`} description={propertyName} />
      <RoomEditForm room={room.data} />
    </section>
  );
}
