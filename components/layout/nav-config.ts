import { Building2, DoorOpen, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import type { Permissions } from "@/server/permissions";

// Satu sumber menu untuk sidebar dan breadcrumb (design.md 5.2).
// Hanya halaman yang sudah dibangun. Menu milestone berikutnya ditambahkan di sini saat halamannya ada.
export type NavGroup = "Ringkasan" | "Operasional" | "Pengaturan";

// Syarat tambahan dari pengaturan properti (BR-16, FR-PRO-05).
export type NavRequirement = "electricityManaged" | "hasFacilities";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  ownerOnly?: boolean;
  requires?: NavRequirement;
};

export const NAV_GROUPS: NavGroup[] = ["Ringkasan", "Operasional", "Pengaturan"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, group: "Ringkasan" },
  { href: "/properti", label: "Properti", icon: Building2, group: "Operasional" },
  { href: "/kamar", label: "Kamar", icon: DoorOpen, group: "Operasional" },
  { href: "/pengguna", label: "Pengguna", icon: Users, group: "Pengaturan", ownerOnly: true },
];

// Judul halaman yang tidak ada di menu (mis. Akun dibuka dari menu pengguna).
const EXTRA_TITLES: Record<string, string> = { "/akun": "Akun" };

export function pageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  if (item) return item.label;
  return EXTRA_TITLES[pathname] ?? "Kostra";
}

// Menu yang ditampilkan untuk peran dan properti yang dipilih (BR-16).
// Menu ber-syarat disembunyikan bila tidak ada satu properti yang dipilih (mis. "Semua properti").
export function visibleNavItems(
  items: NavItem[],
  viewer: { permissions: Pick<Permissions, "manageUsers"> },
  property: { electricityManaged: boolean; hasFacilities: boolean } | null,
): NavItem[] {
  return items.filter((item) => {
    if (item.ownerOnly && !viewer.permissions.manageUsers) return false;
    if (item.requires) {
      if (!property) return false;
      return property[item.requires];
    }
    return true;
  });
}
