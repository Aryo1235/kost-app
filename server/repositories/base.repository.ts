import { eq, inArray, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { Db } from "@/server/db/client";
import type { Scope } from "@/server/scope";

// Klien bisa berupa koneksi biasa atau transaksi dari service (TECH-SPEC 3.2).
export type DbTx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type DbClient = Db | DbTx;

// Semua repository mewarisi kelas ini. Query tanpa helper di bawah dilarang (TECH-SPEC 3.1).
export abstract class BaseRepository {
  constructor(
    protected readonly db: DbClient,
    protected readonly scope: Scope,
  ) {}

  // Filter organisasi dari scope. Dipakai di setiap query baca, ubah, dan hapus.
  protected orgWhere(column: AnyPgColumn): SQL {
    return eq(column, this.scope.organizationId);
  }

  // Manajer hanya ke properti yang ditugaskan. Owner tanpa batas properti.
  protected propertyWhere(column: AnyPgColumn): SQL | undefined {
    if (this.scope.propertyIds === "ALL") return undefined;
    return inArray(column, [...this.scope.propertyIds]);
  }

  // organization_id selalu dari scope. Nilai dari input ditimpa, tidak pernah dipakai.
  protected withOrg<T extends object>(
    values: T,
  ): T & { organizationId: number } {
    return { ...values, organizationId: this.scope.organizationId };
  }
}
