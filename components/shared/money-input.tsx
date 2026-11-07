"use client";

import { type ComponentProps, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Hanya angka yang diambil dari ketikan. Kosong berarti belum diisi.
export function parseRupiahInput(text: string): number | undefined {
  const digits = text.replace(/\D/g, "");
  if (digits.length === 0) return undefined;
  return Number(digits);
}

// Tampilan dengan titik ribuan. Nilai yang disimpan tetap bilangan bulat rupiah (BR-12).
export function formatRupiahInput(value: number | undefined): string {
  return value === undefined ? "" : value.toLocaleString("id-ID");
}

type MoneyInputProps = Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
};

// Kolom nominal rupiah (design.md 6.4): awalan Rp di dalam kolom, angka rata kiri, keyboard angka di HP.
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { value, onValueChange, className, ...props },
  ref,
) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
      >
        Rp
      </span>
      <Input
        ref={ref}
        inputMode="numeric"
        autoComplete="off"
        className={cn("num pl-10", className)}
        value={formatRupiahInput(value)}
        onChange={(e) => onValueChange(parseRupiahInput(e.target.value))}
        {...props}
      />
    </div>
  );
});
