import { convexTest } from "convex-test";
import schema from "../convex/schema";

/**
 * Creates a fresh in-memory Convex test environment backed by the real schema.
 *
 * Call this at the top of each test (or in a beforeEach) to get an isolated `t`
 * object that provides `.mutation()`, `.query()`, `.action()`, and `.run()`.
 *
 * @example
 * const t = setupTest();
 * const id = await t.mutation(api.brands.create, { name: "Acme", slug: "acme", description: "Test brand" });
 */
export function setupTest() {
  return convexTest(schema, import.meta.glob("../convex/**/*.ts"));
}
