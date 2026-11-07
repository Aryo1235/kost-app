import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatItem = {
  label: string;
  value: ReactNode;
  hint: ReactNode;
  href?: string;
};

// Strip angka: satu panel bergaris yang dibagi garis tipis, bukan beberapa kartu (design.md 6.13).
// Di HP sel disusun vertikal, di ≥640px berjajar. Hanya data nyata yang masuk ke sini.
export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <section
      aria-label="Ringkasan"
      className={cn(
        "grid overflow-hidden rounded-xl border border-border bg-card",
        "divide-y divide-border sm:divide-x sm:divide-y-0",
        items.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {items.map((item) => {
        const cell = (
          <>
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="num text-3xl font-semibold tracking-tight">{item.value}</span>
            <span className="text-sm text-muted-foreground">{item.hint}</span>
          </>
        );
        const base = "flex flex-col gap-2 px-6 py-5";
        if (!item.href) {
          return (
            <div key={item.label} className={base}>
              {cell}
            </div>
          );
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              base,
              "transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
            )}
          >
            {cell}
          </Link>
        );
      })}
    </section>
  );
}
