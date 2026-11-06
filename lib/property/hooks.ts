"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/api/trpc";

export function useProperties() {
  const trpc = useTRPC();
  return useQuery(trpc.property.list.queryOptions());
}

export function useCreateProperty() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.property.create.mutationOptions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.property.list.queryKey() }),
  });
}
