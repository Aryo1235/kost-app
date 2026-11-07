"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/api/trpc";

// Daftar properti. Properti nonaktif hanya diminta owner di halaman Properti.
export function useProperties(options: { includeInactive?: boolean } = {}) {
  const trpc = useTRPC();
  return useQuery(
    trpc.property.list.queryOptions(
      options.includeInactive ? { includeInactive: true } : undefined,
    ),
  );
}

// Setiap perubahan properti memuat ulang daftar properti dan pemilih di navbar.
function useInvalidateProperties() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: trpc.property.list.queryKey() });
}

export function useCreateProperty() {
  const trpc = useTRPC();
  const invalidate = useInvalidateProperties();
  return useMutation({
    ...trpc.property.create.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateProperty() {
  const trpc = useTRPC();
  const invalidate = useInvalidateProperties();
  return useMutation({
    ...trpc.property.update.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}

export function useSetPropertyActive() {
  const trpc = useTRPC();
  const invalidate = useInvalidateProperties();
  return useMutation({
    ...trpc.property.setActive.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}
