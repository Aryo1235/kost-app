import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

// Area setelah masuk. Penjaga sesi ada di AppShell dan di backend.
export default function ContentsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
