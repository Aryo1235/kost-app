import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  AUDIT_ACTIONS,
  ELECTRICITY_PATTERNS,
  type ElectricityPattern,
  ROLES,
  ROOM_STATUSES,
  type RoomStatus,
} from "@/shared/enums";

// Daftar nilai untuk CHECK. Diambil dari shared/enums.ts supaya satu sumber.
const inList = (values: readonly string[]) =>
  sql.raw(values.map((v) => `'${v}'`).join(", "));

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// Semua ID memakai angka berurutan (1, 2, 3, ...) sesuai keputusan M0.
const id = () => integer("id").primaryKey().generatedAlwaysAsIdentity();

export const organizations = pgTable("organizations", {
  id: id(),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

export const users = pgTable(
  "users",
  {
    id: id(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    username: text("username").notNull().unique(),
    phone: text("phone"),
    role: text("role").$type<(typeof ROLES)[number]>().notNull(),
    passwordHash: text("password_hash").notNull(),
    mustChangePassword: boolean("must_change_password").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    index("users_organization_id_idx").on(t.organizationId),
    check("users_role_check", sql`${t.role} in (${inList(ROLES)})`),
    check(
      "users_username_check",
      sql`${t.username} ~ '^[a-z0-9._]{3,30}$'`,
    ),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id),
    // SHA-256 dari token di cookie. Token mentah tidak pernah disimpan (TECH-SPEC 3.4).
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

// Tabel global: dipakai sebelum organisasi diketahui (login). Tidak punya organization_id.
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: id(),
    username: text("username").notNull(),
    ip: text("ip"),
    success: boolean("success").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("login_attempts_username_created_idx").on(t.username, t.createdAt),
    index("login_attempts_ip_created_idx").on(t.ip, t.createdAt),
  ],
);

export const properties = pgTable(
  "properties",
  {
    id: id(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    address: text("address").notNull(),
    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),
    hasFacilities: boolean("has_facilities").notNull().default(false),
    electricityManaged: boolean("electricity_managed").notNull().default(false),
    electricityPattern: text("electricity_pattern")
      .$type<ElectricityPattern>()
      .notNull()
      .default("A"),
    createdAt: createdAt(),
  },
  (t) => [
    index("properties_organization_id_idx").on(t.organizationId),
    check(
      "properties_electricity_pattern_check",
      sql`${t.electricityPattern} in (${inList(ELECTRICITY_PATTERNS)})`,
    ),
  ],
);

// Kamar. Kode unik per properti, tidak peka huruf besar-kecil, dan bisa dipakai ulang setelah dihapus (soft delete).
export const rooms = pgTable(
  "rooms",
  {
    id: id(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id),
    code: text("code").notNull(),
    roomType: text("room_type"),
    baseRentAmount: bigint("base_rent_amount", { mode: "number" }).notNull(),
    facilities: text("facilities"),
    status: text("status").$type<RoomStatus>().notNull().default("AVAILABLE"),
    notes: text("notes"),
    createdAt: createdAt(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("rooms_property_code_key")
      .on(t.propertyId, sql`lower(${t.code})`)
      .where(sql`deleted_at is null`),
    index("rooms_org_property_status_idx").on(t.organizationId, t.propertyId, t.status),
    check("rooms_status_check", sql`${t.status} in (${inList(ROOM_STATUSES)})`),
    check("rooms_base_rent_check", sql`${t.baseRentAmount} >= 0`),
  ],
);

export const propertyAccess = pgTable(
  "property_access",
  {
    id: id(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id),
  },
  (t) => [
    uniqueIndex("property_access_user_property_key").on(
      t.userId,
      t.propertyId,
    ),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id),
    propertyId: integer("property_id").references(() => properties.id),
    // Kosong untuk aksi dari skrip server (create-owner, reset-password).
    actorId: integer("actor_id").references(() => users.id),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").$type<(typeof AUDIT_ACTIONS)[number]>().notNull(),
    beforeJson: jsonb("before_json"),
    afterJson: jsonb("after_json"),
    createdAt: createdAt(),
  },
  (t) => [
    index("audit_logs_org_created_idx").on(t.organizationId, t.createdAt),
    index("audit_logs_org_entity_idx").on(
      t.organizationId,
      t.entityType,
      t.entityId,
    ),
    check("audit_logs_action_check", sql`${t.action} in (${inList(AUDIT_ACTIONS)})`),
  ],
);
