import { and, asc, count, eq, ilike, sql } from "drizzle-orm";
import { properties, rooms } from "@/server/db/schema";
import type { RoomStatus } from "@/shared/enums";
import { BaseRepository } from "./base.repository";

export type RoomRow = typeof rooms.$inferSelect;
export type RoomWithProperty = RoomRow & { propertyName: string };

export type RoomValues = {
  propertyId: number;
  code: string;
  roomType: string | null;
  baseRentAmount: number;
  facilities: string | null;
  status: RoomStatus;
  notes: string | null;
};

// Escape % dan _ supaya teks pencarian dibaca apa adanya.
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

// Repository kamar. Semua query lewat orgWhere, propertyWhere, dan notDeleted (AGENTS.md aturan 1).
export class RoomRepository extends BaseRepository {
  private scoped() {
    return and(
      this.orgWhere(rooms.organizationId),
      this.propertyWhere(rooms.propertyId),
      this.notDeleted(rooms.deletedAt),
    );
  }

  // Daftar kamar dengan cari kode, filter status, dan paginasi di server (TECH-SPEC 6.3).
  async list(filter: {
    propertyId?: number;
    search?: string;
    status?: RoomStatus;
    page: number;
    pageSize: number;
  }): Promise<{ rows: RoomWithProperty[]; total: number }> {
    const conditions = [this.scoped()];
    if (filter.propertyId !== undefined) conditions.push(eq(rooms.propertyId, filter.propertyId));
    if (filter.status !== undefined) conditions.push(eq(rooms.status, filter.status));
    if (filter.search) {
      conditions.push(ilike(rooms.code, `%${escapeLike(filter.search)}%`));
    }
    const where = and(...conditions);

    const rows = await this.db
      .select({ room: rooms, propertyName: properties.name })
      .from(rooms)
      .innerJoin(properties, eq(properties.id, rooms.propertyId))
      .where(where)
      .orderBy(asc(properties.name), asc(rooms.code))
      .limit(filter.pageSize)
      .offset((filter.page - 1) * filter.pageSize);

    const [totalRow] = await this.db
      .select({ n: count() })
      .from(rooms)
      .where(where);

    return {
      rows: rows.map((r) => ({ ...r.room, propertyName: r.propertyName })),
      total: Number(totalRow?.n ?? 0),
    };
  }

  async findById(id: number): Promise<RoomRow | null> {
    const [row] = await this.db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, id), this.scoped()))
      .limit(1);
    return row ?? null;
  }

  async insert(values: RoomValues): Promise<RoomRow> {
    const [row] = await this.db.insert(rooms).values(this.withOrg(values)).returning();
    return row;
  }

  async update(id: number, values: Partial<Omit<RoomValues, "propertyId">>): Promise<RoomRow | null> {
    const [row] = await this.db
      .update(rooms)
      .set(values)
      .where(and(eq(rooms.id, id), this.scoped()))
      .returning();
    return row ?? null;
  }

  // Hapus lunak (BR-14). Kode kamar bisa dipakai lagi karena indeks unik hanya untuk baris aktif.
  async softDelete(id: number): Promise<RoomRow | null> {
    const [row] = await this.db
      .update(rooms)
      .set({ deletedAt: sql`now()` })
      .where(and(eq(rooms.id, id), this.scoped()))
      .returning();
    return row ?? null;
  }
}
