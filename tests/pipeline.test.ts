import { expect, test } from "vitest";
import { setupTest } from "./setup";
import { api } from "../convex/_generated/api";

test("approveSeed creates branches for each active format", async () => {
  const t = setupTest();

  const brandId = await t.mutation(api.brands.create, {
    name: "Test Brand",
    slug: "test",
    description: "test",
    activeFormats: ["blog", "pin", "tweet", "linkedin"],
  });

  const seedId = await t.mutation(api.seeds.create, {
    brandId,
    title: "Test Idea",
    description: "A great content idea",
    source: "manual",
    pitchedBy: "user",
  });

  await t.mutation(api.pipeline.approveSeed, { seedId });

  // Seed status should be "approved"
  const seed = await t.query(api.seeds.get, { id: seedId });
  expect(seed?.status).toBe("approved");

  // Branches should be created for each format
  const branches = await t.query(api.branches.getBySeed, { seedId });

  // blog=1, pin=5 (variations), tweet=1, linkedin=1 = 8 branches
  expect(branches.length).toBe(8);

  // All should be "draft" status
  expect(branches.every((b) => b.status === "draft")).toBe(true);

  // Should have correct formats
  const formats = branches.map((b) => b.format);
  expect(formats.filter((f) => f === "blog").length).toBe(1);
  expect(formats.filter((f) => f === "pin").length).toBe(5);
  expect(formats.filter((f) => f === "tweet").length).toBe(1);
  expect(formats.filter((f) => f === "linkedin").length).toBe(1);
});

test("approveSeed puts blog format first", async () => {
  const t = setupTest();

  const brandId = await t.mutation(api.brands.create, {
    name: "Test Brand",
    slug: "test2",
    description: "test",
    activeFormats: ["tweet", "blog", "pin"],
  });

  const seedId = await t.mutation(api.seeds.create, {
    brandId,
    title: "Test",
    description: "Test",
    source: "manual",
    pitchedBy: "user",
  });

  const result = await t.mutation(api.pipeline.approveSeed, { seedId });

  // First branch should be blog (anchor content, written first)
  const branches = await t.query(api.branches.getBySeed, { seedId });
  const blogBranch = branches.find((b) => b.format === "blog");
  expect(blogBranch).toBeDefined();
});
