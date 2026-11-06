"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth/actions";
import { errorMessage } from "@/lib/errors";
import { loginInput } from "@/shared/schemas/auth";

type Values = z.input<typeof loginInput>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(loginInput),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    const result = await login(values.username, values.password);
    if (!result.ok) {
      setServerError(errorMessage(result.code));
      return;
    }
    // Akun dengan sandi sementara langsung diarahkan ke halaman Akun (FR-AUTH-06).
    const mustChange = result.data.mustChangePassword === true;
    router.replace(mustChange ? "/akun" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <p className="mb-8 text-center text-xl font-semibold tracking-tight">Kost</p>
      <h1 className="text-xl font-semibold">Masuk</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Masuk dengan username dan kata sandi Anda.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? "username-error" : undefined}
            {...register("username")}
          />
          {errors.username ? (
            <p id="username-error" className="text-sm text-danger">
              {errorMessage(errors.username.message)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Kata sandi</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" className="text-sm text-danger">
              {errorMessage(errors.password.message)}
            </p>
          ) : null}
        </div>

        {serverError ? (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Memproses…" : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
