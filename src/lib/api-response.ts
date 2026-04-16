import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "PLAN_LIMIT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

const statusMap: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  PLAN_LIMIT: 402,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(code: ErrorCode, message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status: statusMap[code] },
  );
}

export class ApiError extends Error {
  constructor(public code: ErrorCode, message: string, public details?: unknown) {
    super(message);
  }
}

export function handleError(err: unknown) {
  if (err instanceof ApiError) return fail(err.code, err.message, err.details);
  if (err instanceof ZodError) return fail("VALIDATION_ERROR", "Invalid input", err.issues);
  if (err instanceof Error && err.name === "PlanLimitError") {
    const pe = err as Error & { limit?: string; upgradeUrl?: string };
    return fail("PLAN_LIMIT", pe.message, { limit: pe.limit, upgradeUrl: pe.upgradeUrl });
  }
  console.error("Unhandled API error:", err);
  return fail("INTERNAL_ERROR", "Something went wrong");
}
