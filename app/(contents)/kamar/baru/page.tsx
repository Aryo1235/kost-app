import { Suspense } from "react";
import { RoomCreateView } from "../_components/room-create-view";

// Form tambah kamar. Halaman ini hanya menyusun komponen.
export default function NewRoomPage() {
  return (
    <Suspense fallback={null}>
      <RoomCreateView />
    </Suspense>
  );
}
