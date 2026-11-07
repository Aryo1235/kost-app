import { Building2, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

// Satu sumber menu untuk sidebar dan breadcrumb (design.md 5.2).
// Hanya halaman yang sudah dibangun. Menu milestone berikutnya ditambahkan di sini saat halamannya ada.
export type NavGroup = "Ringkasan" | "Operasional" | "Pengaturan";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  ownerOnly?: boolean;
};

export const NAV_GROUPS: NavGroup[] = ["Ringkasan", "Operasional", "Pengaturan"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, group: "Ringkasan" },
  { href: "/properti", label: "Properti", icon: Building2, group: "Operasional" },
  { href: "/pengguna", label: "Pengguna", icon: Users, group: "Pengaturan", ownerOnly: true },
];

// Judul halaman yang tidak ada di menu (mis. Akun dibuka dari menu pengguna).
const EXTRA_TITLES: Record<string, string> = { "/akun": "Akun" };

export function pageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  if (item) return item.label;
  return EXTRA_TITLES[pathname] ?? "Kostra";
}
