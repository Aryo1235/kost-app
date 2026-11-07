"use client";

import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Me } from "@/lib/auth/types";
import { useActiveProperty } from "@/lib/property/active";
import { useProperties } from "@/lib/property/hooks";
import { type PropertyOption, resolveSelection } from "@/lib/property/selection";
import { ROLE_LABELS } from "@/lib/labels";
import { NAV_ITEMS, visibleNavItems } from "./nav-config";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

// Sidebar inset yang bisa diciutkan ke ikon (shadcn dashboard-01, design.md 5.2).
export function AppSidebar({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const properties = useProperties();
  const active = useActiveProperty();
  const options: PropertyOption[] = (properties.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    electricityManaged: p.electricityManaged,
    hasFacilities: p.hasFacilities,
  }));
  const selection = resolveSelection(active, options, me.role === "OWNER");
  const property = selection.kind === "one" ? selection.property : null;
  // BR-16: menu mengikuti pengaturan properti yang dipilih.
  const items = visibleNavItems(NAV_ITEMS, me, property);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Kostra">
              <Link href="/dashboard">
                <Wordmark subtitle={me.organizationName} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          name={me.name}
          username={me.username}
          roleLabel={ROLE_LABELS[me.role]}
          onLogout={onLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
