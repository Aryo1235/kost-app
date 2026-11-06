"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Properti</h1>
        {canManage ? <AddPropertyDialog /> : null}
      </div>

      {properties.isPending ? (
        <p className="mt-6 text-sm text-muted-foreground" role="status">
          Memuat…
        </p>
      ) : properties.isError ? (
        <p role="alert" className="mt-6 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage(codeFromError(properties.error))}
        </p>
      ) : properties.data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {canManage ? "Belum ada properti. Tambahkan properti pertama Anda." : "Belum ada properti yang bisa Anda akses."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-md border border-border bg-card">
          {properties.data.map((p) => (
            <li key={p.id} className="px-4 py-3">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.address}</p>
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
