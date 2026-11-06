import type { Tone } from "@/lib/labels";
import { cn } from "@/lib/utils";

// Warna hanya untuk status. Teks selalu ikut (design.md 6.7, bukan warna saja).
const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-accent text-accent-foreground",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-[13px] font-medium whitespace-nowrap",
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
