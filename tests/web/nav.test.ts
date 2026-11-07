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

const managed = { electricityManaged: true, hasFacilities: false };
const unmanaged = { electricityManaged: false, hasFacilities: false };
const withFacilities = { electricityManaged: false, hasFacilities: true };

describe("BR-16: menu mengikuti pengaturan properti yang bisa diakses", () => {
  it("menu listrik tampil bila minimal satu properti mengelola listrik", () => {
    expect(visibleNavItems(items, owner, [unmanaged, managed]).map((i) => i.href)).toContain("/listrik");
    expect(visibleNavItems(items, owner, [managed]).map((i) => i.href)).toContain("/listrik");
  });

  it("menu listrik hilang bila tidak ada properti yang mengelola listrik", () => {
    expect(visibleNavItems(items, owner, [unmanaged, withFacilities]).map((i) => i.href)).not.toContain("/listrik");
  });

  it("menu fasum tampil bila minimal satu properti punya fasum", () => {
    expect(visibleNavItems(items, owner, [unmanaged, withFacilities]).map((i) => i.href)).toContain("/fasum");
    expect(visibleNavItems(items, owner, [unmanaged, managed]).map((i) => i.href)).not.toContain("/fasum");
  });

  it("tanpa properti, menu ber-syarat disembunyikan dan menu biasa tetap ada", () => {
    const hrefs = visibleNavItems(items, owner, []).map((i) => i.href);
    expect(hrefs).not.toContain("/listrik");
    expect(hrefs).not.toContain("/fasum");
    expect(hrefs).toContain("/kamar");
  });

  it("pengelola tidak melihat menu khusus owner", () => {
    const hrefs = visibleNavItems(items, manager, [managed]).map((i) => i.href);
    expect(hrefs).not.toContain("/pengguna");
    expect(hrefs).toContain("/kamar");
  });
});
