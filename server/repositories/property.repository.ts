import { and, asc, count, eq, sql } from "drizzle-orm";
import { properties, rooms } from "@/server/db/schema";
import type { ElectricityPattern } from "@/shared/enums";
import { BaseRepository } from "./base.repository";

export type PropertyRow = typeof properties.$inferSelect;

// Properti beserta jumlah kamarnya. Kamar yang sudah dihapus tidak dihitung (BR-14).
export type PropertyWithCounts = PropertyRow & {
  roomCount: number;
  availableCount: number;
  occupiedCount: number;
  brokenCount: number;
};

// Nilai saat membuat. Pengaturan yang tidak diisi memakai bawaan database (fasum tidak, listrik tidak, pola A).
export type PropertyValues = {
  name: string;
  address: string;
  notes?: string | null;
  hasFacilities?: boolean;
  electricityManaged?: boolean;
  electricityPattern?: ElectricityPattern;
};

export class PropertyRepository extends BaseRepository {
  // Semua query lewat orgWhere dan propertyWhere (AGENTS.md aturan 1 dan 2).
  private scoped() {
    return and(
      this.orgWhere(properties.organizationId),
      this.propertyWhere(properties.id),
    );
  }

  // Daftar properti dengan jumlah kamar per status. Properti nonaktif disembunyikan kecuali diminta (FR-PRO-03).
  // Kamar ikut terikat organisasi dan belum dihapus (orgWhere dan notDeleted).
  async list(options: { includeInactive?: boolean } = {}): Promise<PropertyWithCounts[]> {
    const where = options.includeInactive
      ? this.scoped()
      : and(this.scoped(), eq(properties.isActive, true));
    const byStatus = (status: string) =>
      sql<number>`count(${rooms.id}) filter (where ${rooms.status} = ${status})`.mapWith(Number);

    const rows = await this.db
      .select({
        property: properties,
        roomCount: count(rooms.id),
        availableCount: byStatus("AVAILABLE"),
        occupiedCount: byStatus("OCCUPIED"),
        brokenCount: byStatus("BROKEN"),
      })
      .from(properties)
      .leftJoin(
        rooms,
        and(
          eq(rooms.propertyId, properties.id),
          this.orgWhere(rooms.organizationId),
          this.notDeleted(rooms.deletedAt),
        ),
      )
      .where(where)
      .groupBy(properties.id)
      .orderBy(asc(properties.id));

    return rows.map((r) => ({
      ...r.property,
      roomCount: Number(r.roomCount),
      availableCount: r.availableCount,
      occupiedCount: r.occupiedCount,
      brokenCount: r.brokenCount,
    }));
  }

  async findById(id: number): Promise<PropertyRow | null> {
    const [row] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), this.scoped()))
      .limit(1);
    return row ?? null;
  }

  async insert(values: PropertyValues): Promise<PropertyRow> {
    const [row] = await this.db
      .insert(properties)
      .values(this.withOrg(values))
      .returning();
    return row;
  }

  async update(
    id: number,
    values: Partial<PropertyValues>,
  ): Promise<PropertyRow | null> {
    const [row] = await this.db
      .update(properties)
      .set(values)
      .where(and(eq(properties.id, id), this.scoped()))
      .returning();
    return row ?? null;
  }

  async setActive(id: number, isActive: boolean): Promise<PropertyRow | null> {
    const [row] = await this.db
      .update(properties)
      .set({ isActive })
      .where(and(eq(properties.id, id), this.scoped()))
      .returning();
    return row ?? null;
  }
}
