import { describe, expect, it } from "vitest";
import { Building2, DoorOpen, Users, Zap } from "lucide-react";
import { type NavItem, visibleNavItems } from "@/components/layout/nav-config";

const items: NavItem[] = [
  { href: "/properti", label: "Properti", icon: Building2, group: "Operasional" },
  { href: "/kamar", label: "Kamar", icon: DoorOpen, group: "Operasional" },
  { href: "/pengguna", label: "Pengguna", icon: Users, group: "Pengaturan", ownerOnly: true },
  { href: "/listrik", label: "Listrik", icon: Zap, group: "Operasional", requires: "electricityManaged" },
  { href: "/fasum", label: "Fasum", icon: Building2, group: "Operasional", requires: "hasFacilities" },
];

const owner = { permissions: { manageUsers: true } };
const manager = { permissions: { manageUsers: false } };

describe("BR-16: menu mengikuti pengaturan properti", () => {
  it("menu listrik hanya tampil bila listrik dikelola", () => {
    const managed = { electricityManaged: true, hasFacilities: false };
    const unmanaged = { electricityManaged: false, hasFacilities: false };
    expect(visibleNavItems(items, owner, managed).map((i) => i.href)).toContain("/listrik");
    expect(visibleNavItems(items, owner, unmanaged).map((i) => i.href)).not.toContain("/listrik");
  });

  it("menu fasum hanya tampil bila properti punya fasum", () => {
    const withFacilities = { electricityManaged: false, hasFacilities: true };
    const without = { electricityManaged: false, hasFacilities: false };
    expect(visibleNavItems(items, owner, withFacilities).map((i) => i.href)).toContain("/fasum");
    expect(visibleNavItems(items, owner, without).map((i) => i.href)).not.toContain("/fasum");
  });

  it("tanpa satu properti yang dipilih, menu ber-syarat disembunyikan", () => {
    const hrefs = visibleNavItems(items, owner, null).map((i) => i.href);
    expect(hrefs).not.toContain("/listrik");
    expect(hrefs).not.toContain("/fasum");
    expect(hrefs).toContain("/kamar");
  });

  it("pengelola tidak melihat menu khusus owner", () => {
    const hrefs = visibleNavItems(items, manager, null).map((i) => i.href);
    expect(hrefs).not.toContain("/pengguna");
    expect(hrefs).toContain("/kamar");
  });
});
