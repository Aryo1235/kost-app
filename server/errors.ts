import { ZodError } from "zod";
import { NextResponse } from "next/server";

// Galat domain. Service melempar ini, bukan TRPCError atau respons HTTP (TECH-SPEC 2.3).
export class DomainError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly ruleId?: string,
  ) {
    super(code);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(code = "NOT_FOUND") {
    super(code, 404);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(code = "UNAUTHORIZED") {
    super(code, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(code = "FORBIDDEN") {
    super(code, 403);
  }
}

export class ConflictError extends DomainError {
  constructor(code: string) {
    super(code, 409);
  }
}

export class RateLimitedError extends DomainError {
  constructor(code = "RATE_LIMITED") {
    super(code, 429);
  }
}

export class BusinessRuleError extends DomainError {
  constructor(code: string, ruleId?: string) {
    super(code, 422, ruleId);
  }
}

// Mengubah galat menjadi respons JSON untuk route handler. Hanya kode, tanpa detail internal.
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof DomainError) {
    return NextResponse.json(
      { code: err.code, ruleId: err.ruleId ?? null },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", fields: err.issues.map((i) => i.path.join(".")) },
      { status: 400 },
    );
  }
  if (err instanceof SyntaxError) {
    return NextResponse.json({ code: "BAD_REQUEST" }, { status: 400 });
  }
  return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
}

// Galat unik dari PostgreSQL (23505). Drizzle membungkus galat driver, jadi kodenya juga dicek di cause.
export function isUniqueViolation(err: unknown): boolean {
  const codeOf = (value: unknown): unknown =>
    typeof value === "object" && value !== null && "code" in value
      ? (value as { code?: unknown }).code
      : undefined;
  const cause =
    typeof err === "object" && err !== null && "cause" in err
      ? (err as { cause?: unknown }).cause
      : undefined;
  return codeOf(err) === "23505" || codeOf(cause) === "23505";
}
