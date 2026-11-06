import pino, { type DestinationStream } from "pino";

// Kunci sensitif disamarkan di semua log (TECH-SPEC 3.4, 2.5). Nilainya tidak pernah ditulis.
const REDACT = [
  "password",
  "currentPassword",
  "newPassword",
  "temporaryPassword",
  "token",
  "cookie",
  "authorization",
  "*.password",
  "*.currentPassword",
  "*.newPassword",
  "*.temporaryPassword",
  "*.token",
  "*.cookie",
  "*.authorization",
  "headers.cookie",
  "headers.authorization",
];

export function createLogger(
  destination?: DestinationStream,
  level: string = process.env.LOG_LEVEL ?? "info",
) {
  return pino(
    {
      level,
      redact: { paths: REDACT, censor: "[REDACTED]" },
    },
    destination,
  );
}

export const logger = createLogger();

// Label lapisan dan modul wajib ada di setiap baris log (AGENTS.md konvensi).
export function childLogger(layer: string, module: string) {
  return logger.child({ layer, module });
}
