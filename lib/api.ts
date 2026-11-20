import { NextResponse } from "next/server";

import type { ApiErrorCode, ApiErrorResponse } from "./types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(status: number, code: ApiErrorCode, message: string) {
  return NextResponse.json<ApiErrorResponse>({ error: { code, message } }, { status });
}
