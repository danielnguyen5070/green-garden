/** `error_code` values sent by the API; mirrors `ErrorCode` in green-garden-api. */
export const ErrorCode = {
  // 404
  NOT_FOUND: 1000,
  CUSTOMER_NOT_FOUND: 1001,
  ADMIN_NOT_FOUND: 1002,
  CATEGORY_NOT_FOUND: 1003,
  PLANT_NOT_FOUND: 1004,
  PLANT_IMAGE_NOT_FOUND: 1005,
  PLANT_POT_SIZE_NOT_FOUND: 1006,
  ORDER_NOT_FOUND: 1007,
  REVIEW_NOT_FOUND: 1008,
  NOTIFICATION_NOT_FOUND: 1009,
  POT_SIZE_UNAVAILABLE: 1010,
  // 409
  CONFLICT: 2000,
  ADMIN_EMAIL_TAKEN: 2001,
  CUSTOMER_PHONE_TAKEN: 2002,
  CATEGORY_SLUG_TAKEN: 2003,
  PLANT_SLUG_TAKEN: 2004,
  PLANT_SKU_TAKEN: 2005,
  INSUFFICIENT_STOCK: 2006,
  PLANT_UNAVAILABLE: 2007,
  DUPLICATE_RESOURCE: 2008,
  // 401 / 403
  UNAUTHORIZED: 3000,
  INVALID_CREDENTIALS: 3001,
  INVALID_TOKEN: 3002,
  FORBIDDEN: 3050,
  SUBMISSION_REJECTED: 3051,
  // 400 / 405 / 422
  BAD_REQUEST: 4000,
  VALIDATION_ERROR: 4001,
  SELF_DEACTIVATION: 4002,
  CUSTOMER_INACTIVE: 4003,
  ORDER_TOTAL_TOO_LARGE: 4004,
  INVALID_STATUS_TRANSITION: 4005,
  METHOD_NOT_ALLOWED: 4006,
  // 5xx / 429
  INTERNAL_ERROR: 5000,
  DATABASE_ERROR: 5001,
  SERVICE_UNAVAILABLE: 5002,
  RATE_LIMITED: 5003,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Body of every non-2xx JSON response from the API. */
export type ApiErrorBody = {
  status_code: number;
  error_code: number;
  message: string;
  error: unknown;
};

/** One entry of `error` on a `4001` validation response. */
export type FieldError = {
  /** Dotted location, e.g. `body.customer.phone` or `query.page`. */
  field: string;
  message: string;
  type: string;
};

type ApiErrorOptions = {
  errorCode?: number;
  error?: unknown;
  requestId?: string;
  retryAfterSeconds?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** A 2xx response that is not the JSON the caller expects, e.g. a proxy's HTML page. */
export const INVALID_RESPONSE_MESSAGE = "Unexpected response from the server.";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again.";

export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: number;
  /** `error` from the body: field errors on `4001`, otherwise `null` or extra details. */
  readonly error: unknown;
  /** `X-Request-ID` header, for support on 5xx errors. */
  readonly requestId?: string;
  /** Seconds from the `Retry-After` header, e.g. on `429`. */
  retryAfterSeconds?: number;

  constructor(status: number, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = options.errorCode ?? errorCodeForStatus(status);
    this.error = options.error ?? null;
    this.requestId = options.requestId;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export function isApiErrorBody(payload: unknown): payload is ApiErrorBody {
  return (
    isRecord(payload) &&
    typeof payload.error_code === "number" &&
    typeof payload.message === "string"
  );
}

/** `Retry-After` as whole seconds; HTTP-date values are not used by the API. */
function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

/**
 * Builds an `ApiError` from a non-2xx response. Never throws: a body that is
 * not the API's error shape (proxy page, empty body) gets the generic code
 * and message for its status.
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  return parseApiErrorPayload(response.status, payload, {
    retryAfterSeconds: parseRetryAfter(response.headers.get("retry-after")),
    requestId: response.headers.get("x-request-id") ?? undefined,
  });
}

function parseApiErrorPayload(
  status: number,
  payload: unknown,
  options: Pick<ApiErrorOptions, "requestId" | "retryAfterSeconds"> = {}
): ApiError {
  if (!isApiErrorBody(payload)) {
    return new ApiError(status, defaultMessageForStatus(status), options);
  }

  return new ApiError(status, messageForBody(status, payload), {
    ...options,
    errorCode: payload.error_code,
    error: payload.error ?? null,
  });
}

function messageForBody(status: number, payload: ApiErrorBody): string {
  if (status >= 500 && status !== 503) return GENERIC_MESSAGE;

  switch (payload.error_code) {
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.INVALID_TOKEN:
      return SESSION_EXPIRED_MESSAGE;
    case ErrorCode.VALIDATION_ERROR: {
      const summary = toFieldErrors(payload.error)
        .map(({ field, message }) => {
          const name = stripFieldLocation(field);
          return name ? `${name}: ${message}` : message;
        })
        .join("; ");
      if (summary) return summary;
      break;
    }
  }

  return payload.message.trim() || defaultMessageForStatus(status);
}

function toFieldErrors(error: unknown): FieldError[] {
  if (!Array.isArray(error)) return [];
  return error.filter(
    (item): item is FieldError =>
      isRecord(item) &&
      typeof item.field === "string" &&
      typeof item.message === "string"
  );
}

/** `body.customer.phone` → `customer.phone`; `body` alone → `""`. */
function stripFieldLocation(field: string): string {
  return field.replace(/^(?:body|query|path)(?:\.|$)/, "");
}

/**
 * Field messages of a `4001` validation error keyed by dotted field name
 * without the `body.` / `query.` / `path.` prefix, e.g.
 * `{ "customer.phone": "..." }`. Empty for any other error.
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (
    !(error instanceof ApiError) ||
    error.errorCode !== ErrorCode.VALIDATION_ERROR
  ) {
    return fieldErrors;
  }

  for (const { field, message } of toFieldErrors(error.error)) {
    const name = stripFieldLocation(field);
    if (name && !(name in fieldErrors)) {
      fieldErrors[name] = message;
    }
  }
  return fieldErrors;
}

/** `X-Request-ID` worth showing to the user: only for unexpected 5xx errors. */
export function getErrorReference(error: unknown): string | undefined {
  if (!(error instanceof ApiError) || error.status < 500) return undefined;
  return error.requestId;
}

export function getErrorMessage(error: unknown, fallback = GENERIC_MESSAGE): string {
  if (error instanceof ApiError) {
    const message = error.message || fallback;
    const reference = getErrorReference(error);
    return reference ? `${message} (Error reference: ${reference})` : message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/** Generic code for a status, matching what the API sends for unmapped errors. */
function errorCodeForStatus(status: number): number {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 405:
      return ErrorCode.METHOD_NOT_ALLOWED;
    case 409:
      return ErrorCode.CONFLICT;
    case 422:
      return ErrorCode.VALIDATION_ERROR;
    case 429:
      return ErrorCode.RATE_LIMITED;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return status >= 400 && status < 500
        ? ErrorCode.BAD_REQUEST
        : ErrorCode.INTERNAL_ERROR;
  }
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return SESSION_EXPIRED_MESSAGE;
    case 403:
      return "Request rejected.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict with existing data.";
    case 422:
      return "Please check the form and try again.";
    case 429:
      return "Too many requests. Please try again later.";
    default:
      return GENERIC_MESSAGE;
  }
}
