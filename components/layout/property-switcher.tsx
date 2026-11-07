"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Me } from "@/lib/auth/types";
import { setActiveProperty, useActiveProperty } from "@/lib/property/active";
import { type PropertyOption, resolveSelection } from "@/lib/property/selection";
import { useProperties } from "@/lib/property/hooks";
import { cn } from "@/lib/utils";

// Pemilih properti di navbar (design.md 6.16). Owner punya "Semua properti".
export function PropertySwitcher({ me }: { me: Me }) {
  const properties = useProperties();
  const active = useActiveProperty();
  const options: PropertyOption[] = (properties.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    electricityManaged: p.electricityManaged,
    hasFacilities: p.hasFacilities,
  }));
  const isOwner = me.role === "OWNER";
  const selection = resolveSelection(active, options, isOwner);

  if (selection.kind === "none") return null;
  const label = selection.kind === "all" ? "Semua properti" : selection.property.name;
  const selectedId = selection.kind === "one" ? selection.property.id : "all";

  // Satu properti dan bukan owner: cukup teks, tanpa panah (design.md 5.3).
  if (!isOwner && options.length <= 1) {
    return (
      <span className="flex max-w-[200px] items-center gap-2 truncate text-sm text-muted-foreground">
        <Building2 aria-hidden className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 max-w-[220px] items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium transition-colors hover:bg-muted md:h-8 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`Properti: ${label}`}
        >
          <Building2 aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
          <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {isOwner ? (
          <>
            <DropdownMenuItem onSelect={() => setActiveProperty("all")}>
              <Check aria-hidden className={cn("size-4", selectedId !== "all" && "invisible")} />
              Semua properti
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {options.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => setActiveProperty(p.id)}>
            <Check aria-hidden className={cn("size-4", selectedId !== p.id && "invisible")} />
            {p.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
