import { NextResponse } from "next/server";

import type { ApiErrorCode, ApiErrorResponse } from "./types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(status: number, code: ApiErrorCode, message: string) {
  return NextResponse.json<ApiErrorResponse>({ error: { code, message } }, { status });
}

class InvalidJsonError extends Error {}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new InvalidJsonError();
  }
}

export function withApiErrors<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
  serverErrorMessage = "요청을 처리하지 못했어요. 다시 시도해 주세요.",
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof InvalidJsonError) {
        return fail(400, "BAD_INPUT", "요청 본문을 JSON 형식으로 보내 주세요.");
      }
      return fail(500, "SERVER_ERROR", serverErrorMessage);
    }
  };
}
