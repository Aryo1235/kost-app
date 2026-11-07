"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { codeFromError, errorMessage, fieldErrorMessage } from "@/lib/errors";
import { useMe } from "@/lib/hooks/useMe";
import { ELECTRICITY_PATTERN_LABELS } from "@/lib/labels";
import {
  useCreateProperty,
  useProperties,
  useSetPropertyActive,
  useUpdateProperty,
} from "@/lib/property/hooks";
import type { PropertyRow } from "@/lib/property/types";
import { ELECTRICITY_PATTERN_OPTIONS } from "@/shared/enums";
import { createPropertyInput } from "@/shared/schemas/property";

type PropertyFormInput = z.input<typeof createPropertyInput>;

// Daftar properti (FR-PRO-01 sampai FR-PRO-05). Hanya owner yang bisa mengubah; pengelola melihat saja.
export function PropertyView() {
  const me = useMe();
  const canManage = me.data?.permissions.manageProperties === true;
  const properties = useProperties({ includeInactive: canManage });
  const list = properties.data ?? [];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Properti"
        description={properties.isPending ? "Memuat…" : `${list.length} properti`}
        actions={canManage ? <PropertyFormDialog /> : null}
      />

      {properties.isError ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage(codeFromError(properties.error))}
        </p>
      ) : null}

      {properties.isSuccess && list.length === 0 ? (
        <EmptyState
          icon={<Building2 aria-hidden className="size-8" strokeWidth={1.5} />}
          title="Belum ada properti"
          description={
            canManage
              ? "Tambahkan properti pertama Anda untuk mulai mencatat kamar."
              : "Belum ada properti yang ditugaskan kepada Anda. Hubungi owner."
          }
        />
      ) : null}

      {list.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {list.map((p) => (
            <PropertyItem key={p.id} property={p} canManage={canManage} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function PropertyItem({ property: p, canManage }: { property: PropertyRow; canManage: boolean }) {
  const pattern = ELECTRICITY_PATTERN_LABELS[p.electricityPattern];
  return (
    <li className="flex flex-col gap-3 px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{p.name}</p>
          <p className="text-sm text-muted-foreground">{p.address}</p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <PropertyFormDialog property={p} />
            <PropertyActiveDialog property={p} />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {p.isActive ? null : <StatusBadge label="Nonaktif" tone="neutral" />}
        <StatusBadge label={p.hasFacilities ? "Ada fasum" : "Tanpa fasum"} tone="neutral" />
        <StatusBadge
          label={p.electricityManaged ? "Listrik dikelola" : "Listrik tidak dikelola"}
          tone="neutral"
        />
        <StatusBadge label={pattern.label} tone="neutral" />
      </div>
    </li>
  );
}

function PropertyFormDialog({ property }: { property?: PropertyRow }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {property ? <Button variant="outline">Ubah</Button> : <Button>Tambah properti</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{property ? `Ubah ${property.name}` : "Tambah properti"}</DialogTitle>
          <DialogDescription>Pola listrik menentukan siapa yang membayar PLN dan apakah biayanya ditagihkan ke penyewa.</DialogDescription>
        </DialogHeader>
        {/* Form dipasang ulang setiap dialog dibuka, jadi isiannya selalu dari data terbaru. */}
        <PropertyForm property={property} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function defaultsFor(property?: PropertyRow): PropertyFormInput {
  if (!property) {
    return {
      name: "",
      address: "",
      notes: "",
      hasFacilities: false,
      electricityManaged: false,
      electricityPattern: "A",
    };
  }
  return {
    name: property.name,
    address: property.address,
    notes: property.notes ?? "",
    hasFacilities: property.hasFacilities,
    electricityManaged: property.electricityManaged,
    // Pola lama CUSTOM (BR-17) tidak bisa dipilih lagi: form kosong dan pengguna memilih pola A sampai E.
    electricityPattern:
      property.electricityPattern === "CUSTOM" ? undefined : property.electricityPattern,
  };
}

function PropertyForm({ property, onDone }: { property?: PropertyRow; onDone: () => void }) {
  const create = useCreateProperty();
  const update = useUpdateProperty();
  const pending = create.isPending || update.isPending;
  const failure = create.error ?? update.error;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PropertyFormInput>({
    resolver: zodResolver(createPropertyInput),
    defaultValues: defaultsFor(property),
  });
  const pattern = useWatch({ control, name: "electricityPattern" });
  const patternNote = pattern ? ELECTRICITY_PATTERN_LABELS[pattern].note : undefined;

  async function onSubmit(values: PropertyFormInput) {
    try {
      if (property) await update.mutateAsync({ propertyId: property.id, ...values });
      else await create.mutateAsync(values);
      onDone();
    } catch {
      // Galat ditampilkan di bawah lewat failure.
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField id="property-name" label="Nama properti" error={fieldErrorMessage(errors.name?.message)}>
        {(c) => <Input {...c} {...register("name")} />}
      </FormField>

      <FormField id="property-address" label="Alamat" error={fieldErrorMessage(errors.address?.message)}>
        {(c) => <Input {...c} {...register("address")} />}
      </FormField>

      <FormField
        id="property-pattern"
        label="Pola listrik"
        hint={patternNote}
        error={fieldErrorMessage(errors.electricityPattern?.message)}
      >
        {(c) => (
          <NativeSelect {...c} {...register("electricityPattern")}>
            <option value="" disabled>
              Pilih pola
            </option>
            {ELECTRICITY_PATTERN_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {ELECTRICITY_PATTERN_LABELS[p].label}
              </option>
            ))}
          </NativeSelect>
        )}
      </FormField>

      <div className="flex flex-col divide-y divide-border rounded-md border border-border">
        <Controller
          control={control}
          name="hasFacilities"
          render={({ field }) => (
            <SwitchRow
              id="property-facilities"
              label="Ada fasum"
              hint="Area bersama seperti dapur, parkir, atau ruang tamu."
              checked={field.value === true}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="electricityManaged"
          render={({ field }) => (
            <SwitchRow
              id="property-electricity"
              label="Listrik dikelola aplikasi"
              hint="Pola A tidak dikelola aplikasi. Pola B sampai E dikelola aplikasi."
              checked={field.value === true}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <FormField id="property-notes" label="Catatan" error={fieldErrorMessage(errors.notes?.message)}>
        {(c) => <Textarea {...c} rows={3} {...register("notes")} />}
      </FormField>

      {failure ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage(codeFromError(failure))}
        </p>
      ) : null}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : property ? "Simpan perubahan" : "Simpan properti"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Satu baris pengaturan ya/tidak. Seluruh baris bisa disentuh, jadi target sentuh cukup di HP.
function SwitchRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 px-3 py-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// Nonaktifkan dan aktifkan properti (FR-PRO-03). Konfirmasi ringan: satu kalimat dampak (design.md 6.9).
function PropertyActiveDialog({ property }: { property: PropertyRow }) {
  const [open, setOpen] = useState(false);
  const setActive = useSetPropertyActive();
  const nextActive = !property.isActive;

  async function onConfirm() {
    try {
      await setActive.mutateAsync({ propertyId: property.id, isActive: nextActive });
      setOpen(false);
    } catch {
      // Galat ditampilkan di bawah lewat setActive.error.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setActive.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className={nextActive ? undefined : "!text-danger"}>
          {nextActive ? "Aktifkan" : "Nonaktifkan"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {nextActive ? "Aktifkan" : "Nonaktifkan"} {property.name}?
          </DialogTitle>
          <DialogDescription>
            {nextActive
              ? "Properti kembali muncul di pemilih dan kamar baru bisa ditambahkan."
              : "Properti hilang dari pemilih dan kamar baru tidak bisa ditambahkan. Data kamar tetap tersimpan."}
          </DialogDescription>
        </DialogHeader>
        {setActive.isError ? (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {errorMessage(codeFromError(setActive.error))}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={nextActive ? "default" : "outline"}
            className={nextActive ? undefined : "!border-danger !text-danger hover:bg-danger-soft"}
            onClick={onConfirm}
            disabled={setActive.isPending}
          >
            {setActive.isPending
              ? "Menyimpan…"
              : nextActive
                ? "Aktifkan properti"
                : "Nonaktifkan properti"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
