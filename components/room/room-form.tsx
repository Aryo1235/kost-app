"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { MoneyInput } from "@/components/shared/money-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { codeFromError, errorMessage, fieldErrorMessage } from "@/lib/errors";
import { ROOM_STATUS_LABELS } from "@/lib/labels";
import { useCreateRoom, useUpdateRoom } from "@/lib/room/hooks";
import type { RoomDetail } from "@/lib/room/types";
import type { RoomStatus } from "@/shared/enums";
import { createRoomInput } from "@/shared/schemas/room";

// Form kamar memakai skema yang sama dengan server. Properti selalu ditanyakan di form (design.md 6.20, 6.22).
const formSchema = createRoomInput.extend({
  propertyId: z
    .number({ error: "REQUIRED" })
    .int({ error: "REQUIRED" })
    .positive({ error: "REQUIRED" }),
});
type RoomFormInput = z.input<typeof formSchema>;

export type PropertyChoice = { id: number; name: string };

// Cara properti tampil di form: dipilih, atau baca-saja (hanya satu properti, atau saat ubah).
type PropertyField =
  | { kind: "choose"; options: PropertyChoice[] }
  | { kind: "fixed"; name: string; hint?: string };

function defaultsFor(propertyId: number | undefined, room?: RoomDetail): Partial<RoomFormInput> {
  return {
    propertyId,
    code: room?.code ?? "",
    roomType: room?.roomType ?? "",
    baseRentAmount: room?.baseRentAmount,
    facilities: room?.facilities ?? "",
    status: room?.status ?? "AVAILABLE",
    notes: room?.notes ?? "",
  };
}

// Kamar baru: pengelola dan owner sama-sama bisa mengisi (PRD 2.2).
// Nilai awal properti dari `?properti=ID`. Bila pengguna hanya punya satu properti, tampil baca-saja.
export function RoomCreateForm({
  properties,
  initialPropertyId,
}: {
  properties: PropertyChoice[];
  initialPropertyId?: number;
}) {
  const router = useRouter();
  const create = useCreateRoom();
  const only = properties.length === 1 ? properties[0] : undefined;
  const initial =
    only?.id ?? (properties.some((p) => p.id === initialPropertyId) ? initialPropertyId : undefined);
  const form = useForm<RoomFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(initial),
  });

  async function onSubmit(values: RoomFormInput) {
    try {
      const created = await create.mutateAsync({
        ...values,
        roomType: values.roomType || undefined,
        facilities: values.facilities || undefined,
        notes: values.notes || undefined,
      });
      router.push(`/kamar/${created.id}`);
    } catch {
      // Galat ditampilkan di bawah lewat create.error.
    }
  }

  return (
    <RoomFormShell
      form={form}
      onSubmit={onSubmit}
      pending={create.isPending}
      failure={create.error}
      propertyField={only ? { kind: "fixed", name: only.name } : { kind: "choose", options: properties }}
      statuses={["AVAILABLE", "BROKEN"]}
      submitLabel="Simpan kamar"
      cancelHref={initial ? `/kamar?properti=${initial}` : "/kamar"}
    />
  );
}

// Ubah kamar yang sudah ada. Properti tidak bisa diganti: kamar tidak dipindah antar properti (fase 1).
export function RoomEditForm({ room, propertyName }: { room: RoomDetail; propertyName: string }) {
  const router = useRouter();
  const update = useUpdateRoom();
  const form = useForm<RoomFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(room.propertyId, room),
  });

  async function onSubmit(values: RoomFormInput) {
    try {
      // propertyId ikut terkirim tetapi dibuang oleh skema ubah di server.
      await update.mutateAsync({ ...values, roomId: room.id });
      router.push(`/kamar/${room.id}`);
    } catch {
      // Galat ditampilkan di bawah lewat update.error.
    }
  }

  // Kamar yang terisi tetap menampilkan Terisi, tetapi status itu tidak bisa dipilih manual (FR-ROOM-03).
  const statuses: RoomStatus[] =
    room.status === "OCCUPIED" ? ["OCCUPIED", "AVAILABLE", "BROKEN"] : ["AVAILABLE", "BROKEN"];

  return (
    <RoomFormShell
      form={form}
      onSubmit={onSubmit}
      pending={update.isPending}
      failure={update.error}
      propertyField={{
        kind: "fixed",
        name: propertyName,
        hint: "Kamar tidak bisa dipindah ke properti lain.",
      }}
      statuses={statuses}
      submitLabel="Simpan perubahan"
      cancelHref={`/kamar/${room.id}`}
    />
  );
}

function RoomFormShell({
  form,
  onSubmit,
  pending,
  failure,
  propertyField,
  statuses,
  submitLabel,
  cancelHref,
}: {
  form: UseFormReturn<RoomFormInput>;
  onSubmit: (values: RoomFormInput) => Promise<void>;
  pending: boolean;
  failure: unknown;
  propertyField: PropertyField;
  statuses: RoomStatus[];
  submitLabel: string;
  cancelHref: string;
}) {
  const { register, control, handleSubmit, formState } = form;
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
        {propertyField.kind === "choose" ? (
          <FormField
            id="room-property"
            label="Properti"
            className="md:col-span-2"
            error={fieldErrorMessage(errors.propertyId?.message)}
          >
            {(c) => (
              <NativeSelect
                {...c}
                {...register("propertyId", {
                  setValueAs: (v: string) => (v === "" || v == null ? undefined : Number(v)),
                })}
              >
                <option value="">Pilih properti</option>
                {propertyField.options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </NativeSelect>
            )}
          </FormField>
        ) : (
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Properti</Label>
            <p className="flex h-11 items-center gap-2 rounded-md border border-border bg-muted px-3 text-sm font-medium md:h-10">
              <Building2 aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              {propertyField.name}
            </p>
            {propertyField.hint ? (
              <p className="text-[13px] text-muted-foreground">{propertyField.hint}</p>
            ) : null}
          </div>
        )}

        <FormField
          id="room-code"
          label="Kode kamar"
          hint="Unik di dalam properti yang dipilih. Huruf besar dan kecil dianggap sama."
          error={fieldErrorMessage(errors.code?.message)}
        >
          {(c) => <Input {...c} autoComplete="off" {...register("code")} />}
        </FormField>

        <FormField id="room-type" label="Tipe kamar" error={fieldErrorMessage(errors.roomType?.message)}>
          {(c) => <Input {...c} placeholder="Contoh: Standar, AC" {...register("roomType")} />}
        </FormField>

        <FormField
          id="room-rent"
          label="Harga sewa per bulan"
          error={fieldErrorMessage(errors.baseRentAmount?.message)}
        >
          {(c) => (
            <Controller
              control={control}
              name="baseRentAmount"
              render={({ field }) => (
                <MoneyInput
                  {...c}
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          )}
        </FormField>

        <FormField
          id="room-status"
          label="Status"
          hint="Terisi diatur otomatis saat ada penghuni."
          error={fieldErrorMessage(errors.status?.message)}
        >
          {(c) => (
            <NativeSelect {...c} {...register("status")}>
              {statuses.map((s) => (
                <option key={s} value={s} disabled={s === "OCCUPIED"}>
                  {ROOM_STATUS_LABELS[s].label}
                </option>
              ))}
            </NativeSelect>
          )}
        </FormField>

        <FormField
          id="room-facilities"
          label="Fasilitas kamar"
          className="md:col-span-2"
          error={fieldErrorMessage(errors.facilities?.message)}
        >
          {(c) => <Textarea {...c} rows={3} {...register("facilities")} />}
        </FormField>

        <FormField id="room-notes" label="Catatan" className="md:col-span-2" error={fieldErrorMessage(errors.notes?.message)}>
          {(c) => <Textarea {...c} rows={3} {...register("notes")} />}
        </FormField>
      </div>

      {failure ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage(codeFromError(failure))}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href={cancelHref}>Batal</Link>
        </Button>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
