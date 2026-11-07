import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Select native bergaya Input (design.md 6.3): untuk pilihan kurang dari tujuh.
function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-11 md:h-10 w-full min-w-0 rounded-md border border-input bg-card px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
