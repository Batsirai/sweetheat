/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentRuns from "../agentRuns.js";
import type * as auth from "../auth.js";
import type * as branches from "../branches.js";
import type * as brands from "../brands.js";
import type * as comments from "../comments.js";
import type * as drafts from "../drafts.js";
import type * as integrations from "../integrations.js";
import type * as learnings from "../learnings.js";
import type * as seed from "../seed.js";
import type * as seeds from "../seeds.js";
import type * as todos from "../todos.js";
import type * as training from "../training.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentRuns: typeof agentRuns;
  auth: typeof auth;
  branches: typeof branches;
  brands: typeof brands;
  comments: typeof comments;
  drafts: typeof drafts;
  integrations: typeof integrations;
  learnings: typeof learnings;
  seed: typeof seed;
  seeds: typeof seeds;
  todos: typeof todos;
  training: typeof training;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
