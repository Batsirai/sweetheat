import { describe, it, expect } from "vitest";
import { api } from "../convex/_generated/api";
import { setupTest } from "./setup";

describe("brands smoke test", () => {
  it("creates a brand and it appears in list", async () => {
    const t = setupTest();

    const id = await t.mutation(api.brands.create, {
      name: "Test Brand",
      slug: "test-brand",
      description: "A brand created in the smoke test",
    });

    expect(id).toBeTruthy();

    const brands = await t.query(api.brands.list);

    expect(brands).toHaveLength(1);
    expect(brands[0]._id).toBe(id);
    expect(brands[0].name).toBe("Test Brand");
    expect(brands[0].slug).toBe("test-brand");
    expect(brands[0].description).toBe("A brand created in the smoke test");
    expect(brands[0].isActive).toBe(true);
  });
});
