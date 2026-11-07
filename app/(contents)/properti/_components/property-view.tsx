"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { Label } from "@/components/ui/label";
import { codeFromError, errorMessage } from "@/lib/errors";
import { useMe } from "@/lib/hooks/useMe";
import { useCreateProperty, useProperties } from "@/lib/property/hooks";
import { createPropertyInput } from "@/shared/schemas/property";

type Values = z.input<typeof createPropertyInput>;

export function PropertyView() {
  const me = useMe();
  const properties = useProperties();
  const canManage = me.data?.permissions.manageProperties === true;

  const count = properties.data?.length;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Properti"
        description={count === undefined ? "Memuat…" : `${count} properti`}
        actions={canManage ? <AddPropertyDialog /> : null}
      />

      {properties.isPending ? (
        <p className="text-sm text-muted-foreground" role="status">
          Memuat…
        </p>
      ) : properties.isError ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage(codeFromError(properties.error))}
        </p>
      ) : properties.data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-12 text-center">
          <Building2 aria-hidden className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-base font-semibold">Belum ada properti</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {canManage
              ? "Tambahkan properti pertama Anda untuk mulai mencatat kamar dan tenant."
              : "Belum ada properti yang ditugaskan kepada Anda. Hubungi owner."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {properties.data.map((p) => (
            <li key={p.id} className="flex items-center gap-4 px-6 py-4">
              <Building2 aria-hidden className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-sm text-muted-foreground">{p.address}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AddPropertyDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateProperty();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(createPropertyInput),
    defaultValues: { name: "", address: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await create.mutateAsync(values);
      reset();
      setOpen(false);
    } catch {
      // Galat ditampilkan di bawah lewat create.error.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          create.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Tambah properti</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah properti</DialogTitle>
          <DialogDescription>Isi nama dan alamat bangunan kost.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="property-name">Nama properti</Label>
            <Input
              id="property-name"
              aria-invalid={errors.name ? true : undefined}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-danger">{errorMessage(errors.name.message)}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="property-address">Alamat</Label>
            <Input
              id="property-address"
              aria-invalid={errors.address ? true : undefined}
              {...register("address")}
            />
            {errors.address ? (
              <p className="text-sm text-danger">{errorMessage(errors.address.message)}</p>
            ) : null}
          </div>

          {create.isError ? (
            <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {errorMessage(codeFromError(create.error))}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Menyimpan…" : "Simpan properti"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
