"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, logout } from "@/lib/auth/actions";
import { errorMessage } from "@/lib/errors";
import { useMe } from "@/lib/hooks/useMe";
import { ROLE_LABELS } from "@/lib/labels";
import { changePasswordInput } from "@/shared/schemas/auth";

// Konfirmasi harus sama dengan kata sandi baru. Dicek di klien, dan backend tetap memeriksa aturan lain.
const formSchema = changePasswordInput
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    error: "PASSWORD_MISMATCH",
  });

type Values = z.input<typeof formSchema>;

export function AccountView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const me = useMe();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    const result = await changePassword(values.currentPassword, values.newPassword);
    if (!result.ok) {
      setServerError(errorMessage(result.code));
      return;
    }
    setDone(true);
    // Sesi lama sudah dicabut dan sesi baru sudah terpasang. Muat ulang data pengguna.
    await queryClient.invalidateQueries();
    router.replace("/dashboard");
    router.refresh();
  }

  async function onLogout() {
    await logout();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }

  if (!me.data) return null;
  const mustChange = me.data.mustChangePassword;

  return (
    <section className="max-w-md">
      <h1 className="text-xl font-semibold">Akun</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {me.data.name} · @{me.data.username} · {ROLE_LABELS[me.data.role]}
      </p>

      {mustChange ? (
        <p className="mt-6 rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
          Anda masuk dengan kata sandi sementara. Ganti kata sandi sebelum melanjutkan.
        </p>
      ) : null}

      <h2 className="mt-8 text-base font-semibold">Ganti kata sandi</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-4">
        <Field id="current-password" label="Kata sandi sekarang" error={errors.currentPassword?.message}>
          <Input id="current-password" type="password" autoComplete="current-password" {...register("currentPassword")} />
        </Field>
        <Field id="new-password" label="Kata sandi baru" error={errors.newPassword?.message}>
          <Input id="new-password" type="password" autoComplete="new-password" {...register("newPassword")} />
        </Field>
        <Field id="confirm-password" label="Ulangi kata sandi baru" error={errors.confirmPassword?.message}>
          <Input id="confirm-password" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </Field>

        {serverError ? (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        ) : null}
        {done ? (
          <p role="status" className="text-sm text-success">
            Kata sandi sudah diganti.
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : "Simpan kata sandi"}
        </Button>
      </form>

      {!mustChange ? (
        <div className="mt-10 border-t border-border pt-6">
          <Button variant="outline" onClick={onLogout}>
            Keluar
          </Button>
        </div>
      ) : null}
    </section>
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
