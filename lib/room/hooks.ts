"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/api/trpc";

export type RoomListFilter = {
  propertyId?: number;
  search?: string;
  status?: "AVAILABLE" | "OCCUPIED" | "BROKEN";
  page: number;
  pageSize: number;
};

// Daftar kamar. Pencarian dan halaman ikut kunci query, jadi tiap halaman di-cache sendiri.
export function useRooms(filter: RoomListFilter) {
  const trpc = useTRPC();
  return useQuery(trpc.room.list.queryOptions(filter));
}

export function useRoom(roomId: number | null) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.room.get.queryOptions({ roomId: roomId ?? 0 }),
    enabled: roomId !== null,
  });
}

// Setiap perubahan kamar memuat ulang semua daftar kamar.
function useInvalidateRooms() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: trpc.room.list.queryKey() });
}

export function useCreateRoom() {
  const trpc = useTRPC();
  const invalidate = useInvalidateRooms();
  return useMutation({
    ...trpc.room.create.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateRoom() {
  const trpc = useTRPC();
  const invalidate = useInvalidateRooms();
  return useMutation({
    ...trpc.room.update.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}

export function useRemoveRoom() {
  const trpc = useTRPC();
  const invalidate = useInvalidateRooms();
  return useMutation({
    ...trpc.room.remove.mutationOptions(),
    onSuccess: () => invalidate(),
  });
}
