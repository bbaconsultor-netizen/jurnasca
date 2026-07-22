import { describe, it, expect } from "vitest";
import { canalSchema } from "./canal";

describe("canalSchema", () => {
  it("accepts a valid canal", () => {
    expect(canalSchema.safeParse({ nombre: "Canal Principal", subsector: "Subsector A" }).success).toBe(
      true
    );
  });

  it("rejects an empty nombre", () => {
    expect(canalSchema.safeParse({ nombre: "", subsector: "Subsector A" }).success).toBe(false);
  });
});
