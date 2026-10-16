import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api/client";
import { ApiError, ErrorCode } from "@/lib/api/errors";

function errorResponse(
  status: number,
  errorCode: number,
  message: string,
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({ status_code: status, error_code: errorCode, message, error: null }),
    { status, headers: { "content-type": "application/json", ...headers } }
  );
}

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client errors", () => {
  it("throws an ApiError carrying the error code and headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        errorResponse(409, ErrorCode.INSUFFICIENT_STOCK, "Insufficient stock", {
          "x-request-id": "req-9",
        })
      )
    );

    const error = await api.post("/orders", {}).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      errorCode: ErrorCode.INSUFFICIENT_STOCK,
      message: "Insufficient stock",
      requestId: "req-9",
    });
  });

  it("refreshes the session on 401 and retries once", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        errorResponse(401, ErrorCode.INVALID_TOKEN, "Could not validate credentials")
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(okResponse({ id: "a1" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.get("/auth/me")).resolves.toEqual({ id: "a1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/auth/refresh");
  });

  it("throws the 401 when the refresh fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          errorResponse(401, ErrorCode.INVALID_TOKEN, "Could not validate credentials")
        )
        .mockResolvedValueOnce(
          errorResponse(401, ErrorCode.INVALID_TOKEN, "Could not validate credentials")
        )
    );

    const error = await api.get("/auth/me").catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, errorCode: ErrorCode.INVALID_TOKEN });
  });

  it("does not refresh on a failed login", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        errorResponse(401, ErrorCode.INVALID_CREDENTIALS, "Invalid email or password")
      );
    vi.stubGlobal("fetch", fetchMock);

    const error = await api
      .post("/auth/login", { email: "a@b.c", password: "x" }, { skipAuthRefresh: true })
      .catch((err: unknown) => err);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ errorCode: ErrorCode.INVALID_CREDENTIALS });
  });
});
