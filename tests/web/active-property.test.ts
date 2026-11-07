import { describe, expect, it } from "vitest";
import { parseActiveProperty, readCookie } from "@/lib/property/active";

describe("properti aktif (tampilan)", () => {
  it("'all' dan id positif dikenali, nilai lain ditolak", () => {
    expect(parseActiveProperty("all")).toBe("all");
    expect(parseActiveProperty("3")).toBe(3);
    expect(parseActiveProperty("")).toBeNull();
    expect(parseActiveProperty(null)).toBeNull();
    expect(parseActiveProperty("-1")).toBeNull();
    expect(parseActiveProperty("1.5")).toBeNull();
    expect(parseActiveProperty("abc")).toBeNull();
  });

  it("membaca nilai cookie yang benar di antara cookie lain", () => {
    expect(readCookie("a=1; kost_property=7; b=2", "kost_property")).toBe("7");
    expect(readCookie("a=1", "kost_property")).toBeNull();
  });
});
