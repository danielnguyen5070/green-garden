import { describe, expect, it } from "vitest";
import {
  ApiError,
  ErrorCode,
  getErrorMessage,
  getErrorReference,
  getFieldErrors,
  parseApiError,
  type ApiErrorBody,
} from "@/lib/api/errors";

function jsonResponse(
  body: ApiErrorBody | unknown,
  status: number,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("parseApiError", () => {
  it("reads the standard error body", async () => {
    const error = await parseApiError(
      jsonResponse(
        {
          status_code: 404,
          error_code: ErrorCode.PLANT_NOT_FOUND,
          message: "Plant not found",
          error: null,
        },
        404,
        { "x-request-id": "req-1" }
      )
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.errorCode).toBe(ErrorCode.PLANT_NOT_FOUND);
    expect(error.message).toBe("Plant not found");
    expect(error.error).toBeNull();
    expect(error.requestId).toBe("req-1");
  });

  it("reads Retry-After seconds on 429", async () => {
    const error = await parseApiError(
      jsonResponse(
        {
          status_code: 429,
          error_code: ErrorCode.RATE_LIMITED,
          message: "Too many orders",
          error: null,
        },
        429,
        { "retry-after": "120" }
      )
    );

    expect(error.errorCode).toBe(ErrorCode.RATE_LIMITED);
    expect(error.retryAfterSeconds).toBe(120);
  });

  it("hides 500 messages behind a generic one but keeps the request id", async () => {
    const error = await parseApiError(
      jsonResponse(
        {
          status_code: 500,
          error_code: ErrorCode.INTERNAL_ERROR,
          message: "Internal server error",
          error: null,
        },
        500,
        { "x-request-id": "abc123" }
      )
    );

    expect(error.message).toBe("Something went wrong. Please try again.");
    expect(error.requestId).toBe("abc123");
  });

  it("keeps the API message on 503", async () => {
    const error = await parseApiError(
      jsonResponse(
        {
          status_code: 503,
          error_code: ErrorCode.SERVICE_UNAVAILABLE,
          message: "Bank transfer is not configured",
          error: null,
        },
        503
      )
    );

    expect(error.message).toBe("Bank transfer is not configured");
  });

  it("maps expired-token codes to session copy", async () => {
    const error = await parseApiError(
      jsonResponse(
        {
          status_code: 401,
          error_code: ErrorCode.INVALID_TOKEN,
          message: "Could not validate credentials",
          error: null,
        },
        401
      )
    );

    expect(error.message).toBe(
      "Your session has expired. Please sign in again."
    );
  });

  it("summarizes validation field errors in the message", async () => {
    const error = await parseApiError(
      jsonResponse(
        {
          status_code: 422,
          error_code: ErrorCode.VALIDATION_ERROR,
          message: "Validation error",
          error: [
            {
              field: "body.email",
              message: "value is not a valid email address",
              type: "value_error",
            },
            { field: "body", message: "Invalid JSON", type: "json_invalid" },
          ],
        },
        422
      )
    );

    expect(error.message).toBe(
      "email: value is not a valid email address; Invalid JSON"
    );
  });

  it.each([
    ["an HTML proxy page", "<html>Bad gateway</html>", "text/html"],
    ["an empty body", "", "application/json"],
    ["malformed JSON", "{not json", "application/json"],
    ["the legacy detail shape", '{"detail":"Not Found"}', "application/json"],
  ])("falls back to status defaults for %s", async (_, body, contentType) => {
    const error = await parseApiError(
      new Response(body, {
        status: 404,
        headers: { "content-type": contentType },
      })
    );

    expect(error.status).toBe(404);
    expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
    expect(error.message).toBe("Resource not found.");
    expect(error.error).toBeNull();
  });

  it("gives a proxy 429 the rate-limit code so the UI still branches", async () => {
    const error = await parseApiError(
      new Response("Too Many Requests", {
        status: 429,
        headers: { "retry-after": "30" },
      })
    );

    expect(error.errorCode).toBe(ErrorCode.RATE_LIMITED);
    expect(error.retryAfterSeconds).toBe(30);
  });

  it("gives an unmapped 5xx proxy error the internal code", async () => {
    const error = await parseApiError(new Response("", { status: 502 }));

    expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
    expect(error.message).toBe("Something went wrong. Please try again.");
  });
});

describe("getFieldErrors", () => {
  it("strips location prefixes and keeps the first message per field", () => {
    const error = new ApiError(422, "Validation error", {
      errorCode: ErrorCode.VALIDATION_ERROR,
      error: [
        { field: "body.customer.phone", message: "Invalid phone", type: "value_error" },
        { field: "body.customer.phone", message: "Too long", type: "string_too_long" },
        { field: "query.page", message: "Must be >= 1", type: "greater_than_equal" },
        { field: "path.plant_id", message: "Invalid UUID", type: "uuid_parsing" },
        { field: "body", message: "Invalid JSON", type: "json_invalid" },
        { bogus: true },
      ],
    });

    expect(getFieldErrors(error)).toEqual({
      "customer.phone": "Invalid phone",
      page: "Must be >= 1",
      plant_id: "Invalid UUID",
    });
  });

  it("is empty for non-validation errors", () => {
    expect(
      getFieldErrors(
        new ApiError(409, "Conflict", {
          errorCode: ErrorCode.CUSTOMER_PHONE_TAKEN,
          error: [{ field: "body.phone", message: "x", type: "y" }],
        })
      )
    ).toEqual({});
    expect(getFieldErrors(new Error("boom"))).toEqual({});
    expect(getFieldErrors(null)).toEqual({});
  });

  it("is empty when error is not a list", () => {
    const error = new ApiError(422, "Validation error", {
      errorCode: ErrorCode.VALIDATION_ERROR,
      error: null,
    });

    expect(getFieldErrors(error)).toEqual({});
  });
});

describe("getErrorReference / getErrorMessage", () => {
  it("only exposes the request id on 5xx", () => {
    const serverError = new ApiError(500, "Something went wrong. Please try again.", {
      requestId: "abc123",
    });
    const clientError = new ApiError(409, "Insufficient stock", {
      errorCode: ErrorCode.INSUFFICIENT_STOCK,
      requestId: "abc123",
    });

    expect(getErrorReference(serverError)).toBe("abc123");
    expect(getErrorReference(clientError)).toBeUndefined();
    expect(getErrorMessage(serverError)).toBe(
      "Something went wrong. Please try again. (Error reference: abc123)"
    );
    expect(getErrorMessage(clientError)).toBe("Insufficient stock");
  });

  it("falls back for unknown values", () => {
    expect(getErrorMessage("nope", "Fallback")).toBe("Fallback");
    expect(getErrorMessage(new Error("Network down"))).toBe("Network down");
  });

  it("derives the generic code from status when none is given", () => {
    expect(new ApiError(401, "x").errorCode).toBe(ErrorCode.UNAUTHORIZED);
    expect(new ApiError(418, "x").errorCode).toBe(ErrorCode.BAD_REQUEST);
    expect(new ApiError(200, "x").errorCode).toBe(ErrorCode.INTERNAL_ERROR);
  });
});
