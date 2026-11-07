import type { ReactNode } from "react";

// Keadaan kosong (design.md 6.11): ikon garis redup tanpa kotak, satu kalimat, paling banyak satu tombol.
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-12 text-center">
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
