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
import { ROLE_LABELS } from "@/lib/labels";
import { NAV_ITEMS } from "./nav-config";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

// Sidebar inset yang bisa diciutkan ke ikon (shadcn dashboard-01, design.md 5.2).
export function AppSidebar({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || me.permissions.manageUsers);

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
