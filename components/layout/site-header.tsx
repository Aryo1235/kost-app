"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { pageTitle } from "./nav-config";

// Navbar atas di dalam panel inset (shadcn site-header, design.md 5.3).
// Sisi kanan untuk pemilih properti (M1). Tombol aksi utama tidak di sini.
export function SiteHeader({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const title = pageTitle(pathname);
  const isHome = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card md:h-(--header-height) md:rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 max-md:size-11" />
        {/* Garis pemisah sederhana: kelas tinggi Separator bertabrakan dengan bawaannya (cn tanpa merge). */}
        <span aria-hidden className="mx-2 h-4 w-px shrink-0 bg-border" />
        <Breadcrumb>
          <BreadcrumbList>
            {!isHome ? (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Beranda</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            ) : null}
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {children ? <div className="ml-auto flex items-center gap-2">{children}</div> : null}
      </div>
    </header>
  );
}
