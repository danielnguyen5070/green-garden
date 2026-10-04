import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import {
  getStorefrontChangeTags,
  parseStorefrontChange,
} from "@/lib/storefront/revalidate";

/** Reject replays and badly skewed clocks. */
const MAX_CLOCK_SKEW_SECONDS = 5 * 60;
const MAX_BODY_BYTES = 16 * 1024;

function isValidSignature(
  secret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const given = Buffer.from(signature, "utf8");
  const wanted = Buffer.from(expected, "utf8");
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

function isFreshTimestamp(timestamp: string): boolean {
  if (!/^\d{1,12}$/.test(timestamp)) return false;
  const skew = Math.abs(Date.now() / 1000 - Number(timestamp));
  return skew <= MAX_CLOCK_SKEW_SECONDS;
}

/**
 * Catalog change webhook for FastAPI. The body is
 * `{ "entity": "plants" | "categories" | "reviews" | "shipping_policy", "slugs"?: string[] }`,
 * signed as `hex(HMAC-SHA256(secret, "{timestamp}.{rawBody}"))` with the
 * Unix timestamp in `X-Revalidate-Timestamp`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[revalidate] REVALIDATE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const timestamp = request.headers.get("x-revalidate-timestamp") ?? "";
  const signature = request.headers.get("x-revalidate-signature") ?? "";
  const body = await request.text();

  if (
    body.length > MAX_BODY_BYTES ||
    !isFreshTimestamp(timestamp) ||
    !isValidSignature(secret, timestamp, body, signature)
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const change = parseStorefrontChange(payload);
  if (!change) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const tags = getStorefrontChangeTags(change);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: tags });
}
