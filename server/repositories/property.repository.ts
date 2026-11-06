import { and, asc, eq } from "drizzle-orm";
import { properties } from "@/server/db/schema";
import { BaseRepository } from "./base.repository";

export type PropertyRow = typeof properties.$inferSelect;

export class PropertyRepository extends BaseRepository {
  // Semua query lewat orgWhere dan propertyWhere (AGENTS.md aturan 1 dan 2).
  private scoped() {
    return and(
      this.orgWhere(properties.organizationId),
      this.propertyWhere(properties.id),
    );
  }

  async list(): Promise<PropertyRow[]> {
    return this.db
      .select()
      .from(properties)
      .where(this.scoped())
      .orderBy(asc(properties.id));
  }

  async findById(id: number): Promise<PropertyRow | null> {
    const [row] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), this.scoped()))
      .limit(1);
    return row ?? null;
  }

  async insert(values: { name: string; address: string }): Promise<PropertyRow> {
    const [row] = await this.db
      .insert(properties)
      .values(this.withOrg(values))
      .returning();
    return row;
  }

  async update(
    id: number,
    values: Partial<{ name: string; address: string }>,
  ): Promise<PropertyRow | null> {
    const [row] = await this.db
      .update(properties)
      .set(values)
      .where(and(eq(properties.id, id), this.scoped()))
      .returning();
    return row ?? null;
  }
}
