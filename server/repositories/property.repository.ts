import { and, asc, eq } from "drizzle-orm";
import { properties } from "@/server/db/schema";
import type { ElectricityPattern } from "@/shared/enums";
import { BaseRepository } from "./base.repository";

export type PropertyRow = typeof properties.$inferSelect;

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

  // Daftar properti. Properti nonaktif disembunyikan kecuali diminta (FR-PRO-03).
  async list(options: { includeInactive?: boolean } = {}): Promise<PropertyRow[]> {
    const where = options.includeInactive
      ? this.scoped()
      : and(this.scoped(), eq(properties.isActive, true));
    return this.db.select().from(properties).where(where).orderBy(asc(properties.id));
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
