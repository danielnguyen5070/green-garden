import { describe, expect, it } from "vitest";
import {
  emailSchema,
  httpUrlSchema,
  isValidEmail,
  isValidHttpUrl,
  optionalEmailSchema,
  optionalHttpUrlSchema,
} from "@/lib/validation/primitives";

describe("email helpers", () => {
  it("matches the admin email regex", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(emailSchema.safeParse("a@b.co").success).toBe(true);
    expect(optionalEmailSchema.safeParse("").success).toBe(true);
    expect(optionalEmailSchema.safeParse("bad").success).toBe(false);
  });
});

describe("http url helpers", () => {
  it("allows only http(s)", () => {
    expect(isValidHttpUrl("https://example.com/x")).toBe(true);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(httpUrlSchema.safeParse("http://localhost:3000").success).toBe(
      true
    );
    expect(optionalHttpUrlSchema.safeParse("").success).toBe(true);
    expect(optionalHttpUrlSchema.safeParse("notaurl").success).toBe(false);
  });
});
