import { describe, expect, it } from "vitest";
import { getApiBaseUrl } from "./lib/api/config";
import nextConfig from "./next.config";

async function headersFor(source: string): Promise<Map<string, string>> {
  const rules = (await nextConfig.headers?.()) ?? [];
  const rule = rules.find((r) => r.source === source);
  return new Map((rule?.headers ?? []).map((h) => [h.key, h.value]));
}

function directive(csp: string, name: string): string | undefined {
  return csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.split(" ")[0] === name);
}

describe("security headers", () => {
  it("sends the selected headers on every route", async () => {
    const headers = await headersFor("/:path*");

    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    );
    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains",
    );
  });

  it("omits cross-origin isolation headers that would break embeds", async () => {
    const headers = await headersFor("/:path*");

    expect(headers.has("Cross-Origin-Embedder-Policy")).toBe(false);
    expect(headers.has("Cross-Origin-Resource-Policy")).toBe(false);
  });

  it("keeps the CSP compatible with analytics, maps, images and the API", async () => {
    const csp = (await headersFor("/:path*")).get("Content-Security-Policy") ?? "";

    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(directive(csp, "script-src")).toContain("https://*.googletagmanager.com");
    expect(directive(csp, "connect-src")).toContain("https://*.google-analytics.com");
    expect(directive(csp, "connect-src")).toContain(new URL(getApiBaseUrl()).origin);
    expect(directive(csp, "frame-src")).toContain("https://www.google.com");
    expect(directive(csp, "img-src")).toContain("https:");
  });
});
