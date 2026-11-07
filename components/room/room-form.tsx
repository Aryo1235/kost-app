"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { MoneyInput } from "@/components/shared/money-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { codeFromError, errorMessage, fieldErrorMessage } from "@/lib/errors";
import { ROOM_STATUS_LABELS } from "@/lib/labels";
import { useCreateRoom, useUpdateRoom } from "@/lib/room/hooks";
import type { RoomDetail } from "@/lib/room/types";
import type { RoomStatus } from "@/shared/enums";
import { createRoomInput } from "@/shared/schemas/room";

// Form kamar memakai skema yang sama dengan server; propertyId dibawa dari halaman (design.md 1.3: halaman penuh).
const formSchema = createRoomInput.omit({ propertyId: true });
type RoomFormInput = z.input<typeof formSchema>;

function defaultsFor(room?: RoomDetail): Partial<RoomFormInput> {
  return {
    code: room?.code ?? "",
    roomType: room?.roomType ?? "",
    baseRentAmount: room?.baseRentAmount,
    facilities: room?.facilities ?? "",
    status: room?.status ?? "AVAILABLE",
    notes: room?.notes ?? "",
  };
}

// Kamar baru: pengelola dan owner sama-sama bisa mengisi (PRD 2.2).
export function RoomCreateForm({ propertyId }: { propertyId: number }) {
  const router = useRouter();
  const create = useCreateRoom();
  const form = useForm<RoomFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(),
  });

  async function onSubmit(values: RoomFormInput) {
    try {
      const created = await create.mutateAsync({
        propertyId,
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
      statuses={["AVAILABLE", "BROKEN"]}
      submitLabel="Simpan kamar"
      cancelHref="/kamar"
    />
  );
}

// Ubah kamar yang sudah ada. Hapus memakai hapus lunak (BR-14) dan tetap dicatat di audit.
export function RoomEditForm({ room }: { room: RoomDetail }) {
  const router = useRouter();
  const update = useUpdateRoom();
  const form = useForm<RoomFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(room),
  });

  async function onSubmit(values: RoomFormInput) {
    try {
      await update.mutateAsync({ roomId: room.id, ...values });
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
  statuses,
  submitLabel,
  cancelHref,
}: {
  form: UseFormReturn<RoomFormInput>;
  onSubmit: (values: RoomFormInput) => Promise<void>;
  pending: boolean;
  failure: unknown;
  statuses: RoomStatus[];
  submitLabel: string;
  cancelHref: string;
}) {
  const { register, control, handleSubmit, formState } = form;
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
        <FormField
          id="room-code"
          label="Kode kamar"
          hint="Unik di dalam properti. Huruf besar dan kecil dianggap sama."
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
