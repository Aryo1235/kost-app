import { Suspense } from "react";
import { RoomListView } from "./_components/room-list-view";

// Halaman daftar kamar. Data diambil di komponen klien (AGENTS.md aturan 4).
export default function RoomsPage() {
  return (
    <Suspense fallback={null}>
      <RoomListView />
    </Suspense>
  );
}
