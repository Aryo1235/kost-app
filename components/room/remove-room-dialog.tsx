"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { codeFromError, errorMessage } from "@/lib/errors";
import { useRemoveRoom } from "@/lib/room/hooks";

// Hapus kamar (FR-ROOM-06). Tingkat berat (design.md 6.9): dampak dijelaskan, tombol merah solid.
// Dibuka dari menu ⋯ di halaman detail, jadi status buka dikendalikan pemanggil.
export function RemoveRoomDialog({
  roomId,
  code,
  open,
  onOpenChange,
}: {
  roomId: number;
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const remove = useRemoveRoom();

  async function onConfirm() {
    try {
      await remove.mutateAsync({ roomId });
      onOpenChange(false);
      router.push("/kamar");
    } catch {
      // Galat ditampilkan di bawah lewat remove.error.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) remove.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus kamar {code}?</DialogTitle>
          <DialogDescription>Kamar hilang dari daftar. Kodenya bisa dipakai lagi nanti.</DialogDescription>
        </DialogHeader>
        {remove.isError ? (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {errorMessage(codeFromError(remove.error))}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={remove.isPending}>
            {remove.isPending ? "Menghapus…" : "Hapus kamar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
