"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/api/trpc";

// enabled: false untuk pengelola, supaya tidak memanggil prosedur khusus owner.
export function useUsers(options: { enabled?: boolean } = {}) {
  const trpc = useTRPC();
  return useQuery({ ...trpc.user.list.queryOptions(), enabled: options.enabled ?? true });
}

// Setiap perubahan pengguna memuat ulang daftar pengguna.
function useInvalidateUsers() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: trpc.user.list.queryKey() });
}

export function useCreateUser() {
  const trpc = useTRPC();
  const invalidate = useInvalidateUsers();
  return useMutation({
    ...trpc.user.create.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}

export function useSetUserActive() {
  const trpc = useTRPC();
  const invalidate = useInvalidateUsers();
  return useMutation({
    ...trpc.user.setActive.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}

export function useSetPropertyAccess() {
  const trpc = useTRPC();
  const invalidate = useInvalidateUsers();
  return useMutation({
    ...trpc.user.setPropertyAccess.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}

export function useResetUserPassword() {
  const trpc = useTRPC();
  return useMutation(trpc.user.resetPassword.mutationOptions());
}
