import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn class merging utility", () => {
  it("merges standard class names correctly", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes and falsy values", () => {
    expect(cn("base-class", false && "hidden", null, undefined, "active")).toBe(
      "base-class active"
    );
  });

  it("resolves conflicting Tailwind utilities appropriately", () => {
    expect(cn("px-2 text-red-500", "px-4 text-blue-500")).toBe("px-4 text-blue-500");
  });
});
