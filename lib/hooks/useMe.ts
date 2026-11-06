"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/api/trpc";

// Profil dan izin pengguna yang sedang masuk. Dipakai untuk menyembunyikan menu.
export function useMe() {
  const trpc = useTRPC();
  return useQuery(trpc.auth.me.queryOptions());
}
