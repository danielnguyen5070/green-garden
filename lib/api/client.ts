import { getApiUrl } from "@/lib/api/config";
import { ApiError, parseApiErrorPayload } from "@/lib/api/errors";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  /** Skip the 401 → refresh → retry flow (login, refresh itself). */
  skipAuthRefresh?: boolean;
  /** When true, 401 after failed refresh will not trigger a redirect. */
  skipAuthRedirect?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

function buildUrl(
  path: string,
  query?: RequestOptions["query"]
): string {
  const url = new URL(getApiUrl(path));
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text || null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function attemptTokenRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(getApiUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function clearSessionAndRedirectToLogin(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await fetch(getApiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    // Continue to login even if logout fails.
  }

  const pathname = window.location.pathname;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return;
  }

  const redirect =
    pathname.startsWith("/admin") && pathname !== "/admin"
      ? `?redirect=${encodeURIComponent(pathname)}`
      : "";
  // Hard navigation clears in-memory auth state and avoids refresh loops.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional full reload after session clear
  window.location.assign(`/admin/login${redirect}`);
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    signal,
    skipAuthRefresh = false,
    skipAuthRedirect = false,
  } = options;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    path !== "/auth/login" &&
    path !== "/auth/refresh"
  ) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return request<T>(path, {
        ...options,
        skipAuthRefresh: true,
      });
    }

    if (!skipAuthRedirect) {
      await clearSessionAndRedirectToLogin();
    }

    const payload = await parseResponseBody(response);
    throw parseApiErrorPayload(401, payload);
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw parseApiErrorPayload(response.status, payload);
  }

  return payload as T;
}

export const api = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(path, { ...options, method: "POST", body });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};

export { ApiError };
