import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Logo Kostra: kotak 32px --sidebar-primary berisi ikon gedung, lalu nama.
// Satu-satunya ikon yang boleh berada di kotak berwarna (design.md 1.3).
export function Wordmark({ subtitle, className }: { subtitle?: string; className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Building2 aria-hidden className="size-4" />
      </span>
      <span className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight">Kostra</span>
        {subtitle ? (
          <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );
}
