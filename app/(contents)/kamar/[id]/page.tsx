import { notFound } from "next/navigation";
import { RoomEditView } from "../_components/room-edit-view";

// Detail dan ubah kamar. Halaman ini hanya membaca parameter dan menyusun komponen.
export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roomId = Number(id);
  if (!Number.isInteger(roomId) || roomId <= 0) notFound();
  return <RoomEditView roomId={roomId} />;
}
