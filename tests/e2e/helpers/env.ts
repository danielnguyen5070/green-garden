/** Production storefront host — never target its API from E2E. */
const PRODUCTION_HOST_MARKERS = [
  "ngocnganbentre.vn",
  "www.ngocnganbentre.vn",
];

function isLoopbackOrPrivate(hostname: string): boolean {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  ) {
    return true;
  }

  // RFC 1918 / link-local IPv4
  if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)) return true;
  if (/^169\.254\.\d+\.\d+$/.test(hostname)) return true;

  return false;
}

export function getE2eApiUrl(): string {
  return (
    process.env.E2E_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:8000"
  );
}

export function getCheckoutFixtures() {
  // Dedicated synthetic VN mobile — avoid real shop/contact numbers that may
  // already exist as inactive customers in the test database.
  return {
    phone: process.env.E2E_CHECKOUT_PHONE?.trim() || "0370000099",
    name: process.env.E2E_CHECKOUT_NAME?.trim() || "E2E Test Customer",
    address:
      process.env.E2E_CHECKOUT_ADDRESS?.trim() ||
      "618/34 Ap Binh Tay, Vinh Thanh, Vinh Long",
  };
}

/** Admin credentials for E2E — required; never hardcode secrets in the repo. */
export function getAdminCredentials() {
  const email = process.env.E2E_ADMIN_EMAIL?.trim();
  const password = process.env.E2E_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to a local/test admin account before running admin E2E tests.",
    );
  }

  return { email, password };
}

/**
 * Refuse production and unapproved remote APIs so COD orders never hit live data.
 */
export function assertSafeE2eApiUrl(apiUrl = getE2eApiUrl()): string {
  let parsed: URL;
  try {
    parsed = new URL(apiUrl);
  } catch {
    throw new Error(
      `Invalid E2E API URL "${apiUrl}". Set E2E_API_URL or NEXT_PUBLIC_API_URL to a test/local backend.`,
    );
  }

  const hostname = parsed.hostname.toLowerCase();

  if (PRODUCTION_HOST_MARKERS.some((marker) => hostname === marker || hostname.endsWith(`.${marker}`))) {
    throw new Error(
      `Refusing to run E2E against production host "${hostname}". Point E2E_API_URL at a local or dedicated test API.`,
    );
  }

  const allowRemote = process.env.E2E_ALLOW_REMOTE === "1";
  if (!isLoopbackOrPrivate(hostname) && !allowRemote) {
    throw new Error(
      `E2E API host "${hostname}" is not local. Use a local/test API, or set E2E_ALLOW_REMOTE=1 only for a dedicated non-production staging API.`,
    );
  }

  return apiUrl.replace(/\/$/, "");
}
