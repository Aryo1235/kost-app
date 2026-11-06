import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/server/env";
import * as schema from "./schema";

// Klien db mentah. Hanya boleh dipakai di server/db, repository, dan service (TECH-SPEC 3.1).
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle({ client: pool, schema });
export type Db = typeof db;
