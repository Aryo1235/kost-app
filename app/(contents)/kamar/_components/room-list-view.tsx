"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { codeFromError, errorMessage } from "@/lib/errors";
import { formatRupiah } from "@/lib/format";
import { useMe } from "@/lib/hooks/useMe";
import { ROOM_STATUS_LABELS } from "@/lib/labels";
import { useActiveProperty } from "@/lib/property/active";
import { useProperties } from "@/lib/property/hooks";
import { type PropertyOption, resolveSelection } from "@/lib/property/selection";
import { useRooms } from "@/lib/room/hooks";
import type { RoomRow } from "@/lib/room/types";
import type { TableFeatureSet } from "@/lib/table/features";
import type { RoomStatus } from "@/shared/enums";

const PAGE_SIZE = 20;
const STATUS_FILTERS: RoomStatus[] = ["AVAILABLE", "OCCUPIED", "BROKEN"];

function parseStatus(raw: string | null): RoomStatus | undefined {
  return STATUS_FILTERS.find((s) => s === raw);
}

function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

// Daftar kamar (FR-ROOM-01, FR-ROOM-02). Cari, filter status, dan halaman ada di URL dan dijalankan di server.
export function RoomListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const me = useMe();
  const properties = useProperties();
  const active = useActiveProperty();

  const q = searchParams.get("q") ?? "";
  const status = parseStatus(searchParams.get("status"));
  const page = parsePage(searchParams.get("page"));

  // Ubah parameter URL. Nilai kosong atau null menghapus parameter. Dibaca dari URL terkini, bukan dari render.
  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // Kolom cari menunggu 300 ms setelah ketikan terakhir sebelum mengubah URL.
  const [draft, setDraft] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setDraft(q);
  }
  const timer = useRef<number | undefined>(undefined);
  function onSearchChange(value: string) {
    setDraft(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => update({ q: value.trim(), page: null }), 300);
  }

  const options: PropertyOption[] = (properties.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    electricityManaged: p.electricityManaged,
    hasFacilities: p.hasFacilities,
  }));
  const ready = me.data !== undefined && properties.data !== undefined;
  const isOwner = me.data?.role === "OWNER";
  const selection = resolveSelection(active, options, isOwner);
  const selectedId = selection.kind === "one" ? selection.property.id : undefined;
  const showProperty = selection.kind === "all";

  const rooms = useRooms({
    propertyId: selectedId,
    search: q || undefined,
    status,
    page,
    pageSize: PAGE_SIZE,
  });

  const filtered = q !== "" || status !== undefined;
  const hasProperties = options.length > 0;

  let emptyTitle = "Belum ada kamar";
  let emptyDescription: string | undefined;
  if (filtered) {
    emptyTitle = "Tidak ada data yang cocok";
  } else if (!hasProperties) {
    emptyTitle = "Belum ada properti";
    emptyDescription = isOwner
      ? "Tambahkan properti dulu di menu Properti."
      : "Belum ada properti yang ditugaskan kepada Anda. Hubungi owner.";
  } else if (selection.kind === "one") {
    emptyDescription = `Tambahkan kamar pertama di ${selection.property.name}.`;
  } else {
    emptyDescription = "Pilih satu properti di navbar untuk menambah kamar.";
  }

  const headerDescription =
    selection.kind === "one" ? selection.property.name : selection.kind === "all" ? "Semua properti" : undefined;

  const columns = roomColumns(showProperty);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Kamar"
        description={headerDescription}
        actions={
          selection.kind === "one" ? (
            <Button asChild>
              <Link href="/kamar/baru">Tambah kamar</Link>
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 w-full md:max-w-xs md:flex-1">
          <Label htmlFor="room-search" className="sr-only">
            Cari kode kamar
          </Label>
          <Input
            id="room-search"
            type="search"
            placeholder="Cari kode kamar…"
            autoComplete="off"
            value={draft}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="w-full md:w-44">
          <Label htmlFor="room-status-filter" className="sr-only">
            Filter status
          </Label>
          <NativeSelect
            id="room-status-filter"
            value={status ?? ""}
            onChange={(e) => update({ status: e.target.value, page: null })}
          >
            <option value="">Semua status</option>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {ROOM_STATUS_LABELS[s].label}
              </option>
            ))}
          </NativeSelect>
        </div>
        {filtered ? (
          <Button
            variant="ghost"
            onClick={() => {
              setDraft("");
              update({ q: null, status: null, page: null });
            }}
          >
            Hapus filter
          </Button>
        ) : null}
      </div>

      <DataTable
        columns={columns}
        rows={rooms.data?.rows ?? []}
        rowKey={(row) => row.id}
        renderCard={(row) => <RoomCard room={row} showProperty={showProperty} />}
        caption="Daftar kamar"
        isPending={rooms.isPending || !ready}
        isError={rooms.isError}
        errorMessage={errorMessage(codeFromError(rooms.error))}
        onRetry={() => void rooms.refetch()}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={
          filtered ? (
            <Button
              variant="outline"
              onClick={() => {
                setDraft("");
                update({ q: null, status: null, page: null });
              }}
            >
              Hapus filter
            </Button>
          ) : undefined
        }
        page={page}
        pageSize={PAGE_SIZE}
        total={rooms.data?.total ?? 0}
        onPageChange={(next) => update({ page: String(next) })}
      />
    </section>
  );
}

const helper = createColumnHelper<TableFeatureSet, RoomRow>();

// Kolom tabel desktop (design.md 6.6). Kolom properti hanya saat "Semua properti" dipilih.
// helper.columns menjaga tipe tiap kolom sambil menghasilkan daftar yang diterima DataTable.
function roomColumns(showProperty: boolean) {
  const code = helper.accessor("code", {
    header: "Kode",
    cell: (info) => (
      <Link
        href={`/kamar/${info.row.original.id}`}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  });
  const property = helper.accessor("propertyName", {
    header: "Properti",
    cell: (info) => info.getValue(),
  });
  const type = helper.accessor("roomType", {
    header: "Tipe",
    cell: (info) => <span className="text-muted-foreground">{info.getValue() || "—"}</span>,
  });
  const rent = helper.accessor("baseRentAmount", {
    header: () => <span className="block text-right">Harga sewa</span>,
    cell: (info) => <span className="num block text-right">{formatRupiah(info.getValue())}</span>,
  });
  const status = helper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const label = ROOM_STATUS_LABELS[info.getValue()];
      return <StatusBadge label={label.label} tone={label.tone} />;
    },
  });

  return showProperty
    ? helper.columns([code, property, type, rent, status])
    : helper.columns([code, type, rent, status]);
}

// Tampilan HP: satu kartu per kamar (design.md 6.6). Tanpa gulir samping.
function RoomCard({ room, showProperty }: { room: RoomRow; showProperty: boolean }) {
  const label = ROOM_STATUS_LABELS[room.status];
  const detail = [showProperty ? room.propertyName : null, room.roomType || null]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={`/kamar/${room.id}`} className="flex min-h-[72px] flex-col justify-center gap-1">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-primary">{room.code}</span>
        <StatusBadge label={label.label} tone={label.tone} />
      </div>
      {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
      <p className="num text-sm font-medium">
        {formatRupiah(room.baseRentAmount)}
        <span className="font-normal text-muted-foreground"> / bulan</span>
      </p>
    </Link>
  );
}
