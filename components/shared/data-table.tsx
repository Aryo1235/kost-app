"use client";

import { useTable, type ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { type TableFeatureSet, tableFeatureSet } from "@/lib/table/features";
import { cn } from "@/lib/utils";

// Tabel data dari design.md 6.6. Baris datang dari server, sudah dipaginasi dan difilter.
// Di ≥768px tampil sebagai tabel, di HP sebagai daftar kartu (dari baris yang sama).
export type DataTableProps<T extends object> = {
  columns: ColumnDef<TableFeatureSet, T, unknown>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  renderCard: (row: T) => ReactNode;
  caption: string;
  isPending: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function DataTable<T extends object>({
  columns,
  rows,
  rowKey,
  renderCard,
  caption,
  isPending,
  isError,
  errorMessage,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  page,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<T>) {
  const table = useTable({ features: tableFeatureSet, columns, data: rows });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-danger">{errorMessage}</p>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    );
  }

  if (!isPending && total === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        {isPending ? (
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary"
          />
        ) : null}

        {/* Tabel untuk layar ≥768px */}
        <div
          className={cn(
            "hidden overflow-hidden rounded-xl border border-border bg-card md:block",
            isPending && "opacity-60",
          )}
          aria-busy={isPending}
        >
          <table className="w-full text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead className="bg-muted text-left text-[13px] font-medium text-muted-foreground">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} scope="col" className="h-10 px-4 font-medium">
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={rowKey(row.original)}
                  className="h-11 border-t border-border transition-colors hover:bg-muted/60"
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Daftar kartu untuk HP */}
        <ul
          className={cn(
            "divide-y divide-border overflow-hidden rounded-xl border border-border bg-card md:hidden",
            isPending && "opacity-60",
          )}
          aria-busy={isPending}
        >
          {rows.map((row) => (
            <li key={rowKey(row)} className="px-4 py-4">
              {renderCard(row)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p className="num">
          {total === 0 ? "Tidak ada data" : `Menampilkan ${from}–${to} dari ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1 || isPending}
            onClick={() => onPageChange(page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="num min-w-16 text-center text-foreground">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            disabled={page >= pageCount || isPending}
            onClick={() => onPageChange(page + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
