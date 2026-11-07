"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { codeFromError, errorMessage } from "@/lib/errors";
import { useMe } from "@/lib/hooks/useMe";
import { activeStatus, ROLE_LABELS } from "@/lib/labels";
import {
  useCreateUser,
  useResetUserPassword,
  useSetPropertyAccess,
  useSetUserActive,
  useUsers,
} from "@/lib/user/hooks";
import { useProperties } from "@/lib/property/hooks";
import { createUserInput } from "@/shared/schemas/user";

type UserRow = NonNullable<ReturnType<typeof useUsers>["data"]>[number];
type PropertyOption = { id: number; name: string };

// Kelola pengelola oleh owner (FR-AUTH-03, FR-AUTH-05, FR-AUTH-07). Pengelola tidak masuk halaman ini.
export function UserView() {
  const me = useMe();
  const users = useUsers();
  const properties = useProperties();

  if (!me.data) return null;
  if (!me.data.permissions.manageUsers) {
    return <p className="text-sm text-muted-foreground">Anda tidak punya akses ke halaman ini.</p>;
  }

  const propertyOptions: PropertyOption[] = properties.data ?? [];
  const nameById = new Map(propertyOptions.map((p) => [p.id, p.name]));

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Pengguna"
        description="Akun pengelola dan akses properti mereka"
        actions={<CreateUserDialog properties={propertyOptions} />}
      />

      {users.isError ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage(codeFromError(users.error))}
        </p>
      ) : null}

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {(users.data ?? []).map((u) => {
          const status = activeStatus(u.isActive);
          const access = u.propertyIds.map((id) => nameById.get(id) ?? "").filter(Boolean);
          return (
            <li key={u.id} className="flex flex-col gap-3 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{u.username} · {ROLE_LABELS[u.role]}
                  </p>
                </div>
                <StatusBadge label={status.label} tone={status.tone} />
              </div>
              <p className="text-sm text-muted-foreground">
                {u.role === "OWNER"
                  ? "Semua properti"
                  : access.length > 0
                    ? `Properti: ${access.join(", ")}`
                    : "Belum ada properti"}
                {u.mustChangePassword ? " · Wajib ganti kata sandi" : ""}
              </p>
              {u.role === "MANAGER" ? (
                <div className="flex flex-wrap gap-2">
                  <AccessDialog user={u} properties={propertyOptions} />
                  <ResetPasswordDialog user={u} />
                  <ToggleActiveDialog user={u} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CreateUserDialog({ properties }: { properties: PropertyOption[] }) {
  const [open, setOpen] = useState(false);
  const create = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.input<typeof createUserInput>>({
    resolver: zodResolver(createUserInput),
    defaultValues: { name: "", username: "", password: "", phone: "", propertyIds: [] },
  });
  const selected = useWatch({ control, name: "propertyIds" }) ?? [];

  function toggleProperty(id: number, checked: boolean) {
    const next = checked ? [...selected, id] : selected.filter((x) => x !== id);
    setValue("propertyIds", next, { shouldValidate: true });
  }

  async function onSubmit(values: z.input<typeof createUserInput>) {
    try {
      await create.mutateAsync({
        ...values,
        phone: values.phone || undefined,
        propertyIds: values.propertyIds ?? [],
      });
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
        <Button>Tambah pengelola</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah pengelola</DialogTitle>
          <DialogDescription>
            Pengelola wajib mengganti kata sandi awal saat pertama masuk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field id="user-name" label="Nama lengkap" error={errors.name?.message}>
            <Input id="user-name" {...register("name")} />
          </Field>
          <Field id="user-username" label="Username" error={errors.username?.message}>
            <Input id="user-username" autoCapitalize="none" autoComplete="off" {...register("username")} />
          </Field>
          <Field id="user-password" label="Kata sandi awal" error={errors.password?.message}>
            <Input id="user-password" type="password" autoComplete="new-password" {...register("password")} />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Properti yang boleh diakses</legend>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada properti.</p>
            ) : (
              properties.map((p) => (
                <label key={p.id} className="flex min-h-11 items-center gap-3 md:min-h-0">
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={(checked) => toggleProperty(p.id, checked === true)}
                  />
                  <span className="text-sm">{p.name}</span>
                </label>
              ))
            )}
          </fieldset>

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
              {create.isPending ? "Menyimpan…" : "Simpan pengelola"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccessDialog({ user, properties }: { user: UserRow; properties: PropertyOption[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>(user.propertyIds);
  const save = useSetPropertyAccess();

  async function onSave() {
    try {
      await save.mutateAsync({ userId: user.id, propertyIds: selected });
      setOpen(false);
    } catch {
      // Galat ditampilkan di bawah lewat save.error.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(user.propertyIds);
        if (!next) save.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Atur akses</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Akses properti {user.name}</DialogTitle>
          <DialogDescription>Pengelola hanya melihat properti yang dipilih di sini.</DialogDescription>
        </DialogHeader>
        <fieldset className="flex flex-col gap-2">
          {properties.map((p) => (
            <label key={p.id} className="flex min-h-11 items-center gap-3 md:min-h-0">
              <Checkbox
                checked={selected.includes(p.id)}
                onCheckedChange={(checked) =>
                  setSelected((prev) =>
                    checked === true ? [...prev, p.id] : prev.filter((x) => x !== p.id),
                  )
                }
              />
              <span className="text-sm">{p.name}</span>
            </label>
          ))}
        </fieldset>
        {save.isError ? (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {errorMessage(codeFromError(save.error))}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSave} disabled={save.isPending}>
            {save.isPending ? "Menyimpan…" : "Simpan akses"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Sandi sementara hanya tampil sekali (FR-AUTH-05). Tidak disimpan di mana pun di sisi klien.
function ResetPasswordDialog({ user }: { user: UserRow }) {
  const [open, setOpen] = useState(false);
  const [temporary, setTemporary] = useState<string | null>(null);
  const reset = useResetUserPassword();

  async function onConfirm() {
    try {
      const result = await reset.mutateAsync({ userId: user.id });
      setTemporary(result.temporaryPassword);
    } catch {
      // Galat ditampilkan di bawah lewat reset.error.
    }
  }

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setTemporary(null);
      reset.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button variant="outline">Reset sandi</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset kata sandi {user.name}</DialogTitle>
          <DialogDescription>
            Sesi aktif pengelola ini langsung berakhir. Ia wajib mengganti kata sandi saat masuk.
          </DialogDescription>
        </DialogHeader>

        {temporary ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">Kata sandi sementara:</p>
            <p className="num rounded-md bg-muted px-3 py-2 font-mono text-base break-all">{temporary}</p>
            <p className="text-sm text-warning">Kata sandi ini hanya tampil sekali. Salin dan berikan kepada pengelola.</p>
            <Button
              variant="outline"
              onClick={() => navigator.clipboard?.writeText(temporary)}
            >
              Salin
            </Button>
          </div>
        ) : (
          <>
            {reset.isError ? (
              <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                {errorMessage(codeFromError(reset.error))}
              </p>
            ) : null}
          </>
        )}

        <DialogFooter>
          {temporary ? (
            <DialogClose asChild>
              <Button type="button">Selesai</Button>
            </DialogClose>
          ) : (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="button" onClick={onConfirm} disabled={reset.isPending}>
                {reset.isPending ? "Memproses…" : "Reset kata sandi"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleActiveDialog({ user }: { user: UserRow }) {
  const [open, setOpen] = useState(false);
  const setActive = useSetUserActive();
  const nextActive = !user.isActive;

  async function onConfirm() {
    try {
      await setActive.mutateAsync({ userId: user.id, isActive: nextActive });
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
        <Button variant="outline">{nextActive ? "Aktifkan" : "Nonaktifkan"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{nextActive ? "Aktifkan" : "Nonaktifkan"} {user.name}?</DialogTitle>
          <DialogDescription>
            {nextActive
              ? "Pengelola bisa masuk lagi."
              : "Pengelola langsung keluar dari semua perangkat. Ia tidak bisa masuk sampai diaktifkan kembali."}
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
            variant={nextActive ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={setActive.isPending}
          >
            {nextActive ? "Aktifkan pengelola" : "Nonaktifkan pengelola"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-danger">{errorMessage(error)}</p> : null}
    </div>
  );
}
