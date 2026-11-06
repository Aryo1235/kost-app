import { env } from "@/server/env";
import { LocalStorageDriver } from "./local.driver";

// Penyimpanan privat di luar folder public (TECH-SPEC 7.1).
export const storage = new LocalStorageDriver(env.STORAGE_DIR);
