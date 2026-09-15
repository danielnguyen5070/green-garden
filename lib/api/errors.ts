type ValidationIssue = {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function parseApiErrorPayload(
  status: number,
  payload: unknown
): ApiError {
  if (!isRecord(payload)) {
    return new ApiError(status, defaultMessageForStatus(status), payload);
  }

  const detail = payload.detail;

  if (typeof detail === "string" && detail.trim()) {
    return new ApiError(status, mapDetailMessage(status, detail), detail);
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!isRecord(item)) return null;
        const issue = item as ValidationIssue;
        return typeof issue.msg === "string" ? issue.msg : null;
      })
      .filter((msg): msg is string => Boolean(msg));

    if (messages.length > 0) {
      return new ApiError(status, messages.join(" "), detail);
    }
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return new ApiError(status, payload.message, detail ?? payload);
  }

  return new ApiError(status, defaultMessageForStatus(status), detail ?? payload);
}

function mapDetailMessage(status: number, detail: string): string {
  const normalized = detail.toLowerCase();

  if (status === 401) {
    if (
      normalized.includes("invalid email") ||
      normalized.includes("invalid password") ||
      normalized.includes("incorrect")
    ) {
      return "Invalid email or password.";
    }
    return "Your session has expired. Please sign in again.";
  }

  if (status === 409) {
    if (normalized.includes("email")) {
      return "Email already exists.";
    }
    return detail;
  }

  if (status === 404) {
    return "Resource not found.";
  }

  return detail;
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict with existing data.";
    case 422:
      return "Please check the form and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
